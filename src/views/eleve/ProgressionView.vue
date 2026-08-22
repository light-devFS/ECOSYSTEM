<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Progression & révisions" :notifications-count="2" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement de la progression…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else>
          <div class="content-toolbar">
            <div>
              <h2>Progression & révisions</h2>
              <p class="text-muted">Ta maîtrise par compétence et ton programme de répétition espacée.</p>
            </div>
            <BaseSelect v-model="selectedMatiere" :options="matiereOptions" />
          </div>

          <div class="panel-grid">
            <div class="panel-stack">
              <section class="panel">
                <h3 class="panel__title">{{ selectedMatiere }}</h3>
                <ProgressBar
                  v-for="item in competences"
                  :key="item.competence"
                  :label="item.competence"
                  :percent="item.percent"
                  color="primary"
                />
              </section>

              <section class="panel">
                <h3 class="panel__title">Erreurs fréquentes</h3>
                <div class="error-list">
                  <p v-for="erreur in progression.erreursFrequentes" :key="erreur" class="error-list__item">
                    {{ erreur }}
                  </p>
                </div>
              </section>
            </div>

            <section class="panel">
              <h3 class="panel__title">Révisions programmées</h3>
              <div class="revision-list">
                <div v-for="revision in progression.revisionsProgrammees" :key="revision.titre">
                  <p class="revision-list__periode">{{ revision.periode }}</p>
                  <p class="revision-list__detail">{{ revision.titre }} ({{ revision.matiere }})</p>
                </div>
              </div>
            </section>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import { getProgression } from '@/services/progression/progressionService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const progression = ref({ parMatiere: {}, erreursFrequentes: [], revisionsProgrammees: [] })
const isLoading = ref(true)
const loadError = ref('')
const selectedMatiere = ref('Mathématiques')

onMounted(async () => {
  try {
    progression.value = await getProgression()
    selectedMatiere.value = Object.keys(progression.value.parMatiere)[0] || ''
  } catch (error) {
    loadError.value = 'Impossible de charger la progression.'
  } finally {
    isLoading.value = false
  }
})

const matiereOptions = computed(() =>
  Object.keys(progression.value.parMatiere).map((matiere) => ({ value: matiere, label: matiere }))
)

const competences = computed(() => progression.value.parMatiere[selectedMatiere.value] || [])

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>