<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" title="Programme & Planification" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Programme & Planification</h2>
          <p class="text-muted">Programme officiel par pays, niveau et matière, et planification des séances.</p>
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <div class="filter-bar">
            <BaseSelect label="Pays" stacked v-model="filters.pays" :options="toOptions(programme.pays)" />
            <BaseSelect label="Niveau" stacked v-model="filters.niveau" :options="toOptions(programme.niveaux)" />
            <BaseSelect label="Matiere" stacked v-model="filters.matiere" :options="toOptions(programme.matieres)" />
          </div>

          <section class="panel">
            <span class="section-label">Chapitres du programme</span>
            <table class="task-table">
              <thead>
                <tr>
                  <th>Chapitre</th>
                  <th>Statut</th>
                  <th>Contenus IA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="chapitre in programme.chapitres" :key="chapitre.id">
                  <td>{{ chapitre.chapitre }}</td>
                  <td><BaseBadge :label="statutLabel[chapitre.statut]" :variant="statutVariant[chapitre.statut]" /></td>
                  <td>{{ chapitre.contenusIA }}</td>
                  <td class="task-table__action">
                    <BaseButton variant="secondary" :disabled="!chapitre.ouvrable" @click="handleOpen(chapitre)">
                      Ouvrir
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getProgramme } from '@/services/professeur/programmeService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const statutLabel = { planifie: 'Planifié', 'en-cours': 'En cours', termine: 'Terminé', 'a-planifier': 'A planifier' }
const statutVariant = { planifie: 'info', 'en-cours': 'warning', termine: 'success', 'a-planifier': 'neutral' }

const programme = ref({ pays: [], niveaux: [], matieres: [], chapitres: [] })
const isLoading = ref(true)
const filters = reactive({ pays: 'Togo', niveau: 'Terminale D', matiere: 'Mathématiques' })

function toOptions(list) {
  return list.map((value) => ({ value, label: value }))
}

async function loadProgramme() {
  isLoading.value = true
  programme.value = await getProgramme(filters)
  isLoading.value = false
}

onMounted(loadProgramme)
watch(filters, loadProgramme)

function handleOpen(chapitre) {
  router.push(`/professeur/programme/${chapitre.id}`)
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>