<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Banque d'épreuves" :notifications-count="2" />

      <div class="app-shell__content">
        <div>
          <h2>Banque d'épreuves</h2>
          <p class="text-muted">
            Épreuves collaboratives classées par pays, établissement, niveau, matière et chapitre.
          </p>
        </div>

        <section class="panel">
          <div class="filter-bar">
            <BaseSelect label="Pays" stacked v-model="filters.pays" :options="toOptions(examBank.filtres.pays)" />
            <BaseSelect label="Niveau" stacked v-model="filters.niveau" :options="toOptions(examBank.filtres.niveaux)" />
            <BaseSelect
              label="Matiere"
              stacked
              v-model="filters.matiere"
              :options="toOptions(examBank.filtres.matieres)"
            />
            <BaseSelect
              label="Type d'épreuve"
              stacked
              v-model="filters.type"
              :options="toOptions(examBank.filtres.typesEpreuve)"
            />
          </div>
        </section>

        <section class="panel">
          <div class="results-header">
            <h3 class="panel__title">Résultats</h3>
            <span class="results-header__count">{{ examBank.total }} épreuves</span>
          </div>

          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <table v-else-if="examBank.resultats.length" class="task-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Matière</th>
                <th>Niveau</th>
                <th>Télécharger</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="epreuve in examBank.resultats" :key="epreuve.id">
                <td>{{ epreuve.type }}</td>
                <td>{{ epreuve.matiere }}</td>
                <td>{{ epreuve.niveau }}</td>
                <td>
                  <button type="button" class="icon-button" aria-label="Télécharger l'épreuve" @click="handleDownload(epreuve)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucune épreuve ne correspond à ces filtres.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * BanqueEpreuvesView (élève)
 * Le filtrage est recalculé côté service à chaque changement de filtre
 * (voir examBankService) plutôt que côté vue, pour rester compatible
 * avec un futur filtrage serveur.
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import { getExamBank } from '@/services/examBank/examBankService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const filters = reactive({ pays: 'Togo', niveau: 'Terminale D', matiere: 'Toutes', type: 'Examen' })
const examBank = ref({ filtres: { pays: [], niveaux: [], matieres: [], typesEpreuve: [] }, total: 0, resultats: [] })
const isLoading = ref(true)

function toOptions(list) {
  return list.map((value) => ({ value, label: value }))
}

async function loadExamBank() {
  isLoading.value = true
  examBank.value = await getExamBank(filters)
  isLoading.value = false
}

onMounted(loadExamBank)
watch(filters, loadExamBank)

function handleDownload(epreuve) {
  // Le vrai téléchargement sera branché une fois le stockage des fichiers (Firebase Storage) disponible.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>