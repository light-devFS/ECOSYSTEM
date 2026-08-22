<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Exercices" :notifications-count="2" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement des exercices…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else>
          <div>
            <h2>Exercices</h2>
            <p class="text-muted">
              Exercices progressifs générés à partir de tes chapitres et adaptés à ton niveau.
            </p>
          </div>

          <BaseTabs v-model="activeTab" :tabs="tabs" />

          <table v-if="filteredExercises.length" class="task-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Matières</th>
                <th>Compétences</th>
                <th>Difficulté</th>
                <th>Statut</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="exercise in filteredExercises" :key="exercise.id">
                <td>{{ exercise.titre }}</td>
                <td>{{ exercise.matiere }}</td>
                <td>{{ exercise.competence }}</td>
                <td>
                  <BaseBadge :label="difficultyLabel[exercise.difficulte]" :variant="difficultyVariant[exercise.difficulte]" />
                </td>
                <td>{{ statutLabel[exercise.statut] }}</td>
                <td>{{ exercise.score !== null ? `${exercise.score}%` : '—' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucun exercice dans cette catégorie.</p>
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
import BaseTabs from '@/components/base/BaseTabs.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import { getStudentExercises } from '@/services/exercises/exerciseService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const tabs = [
  { id: 'tous', label: 'Tous' },
  { id: 'a-faire', label: 'À faire' },
  { id: 'en-cours', label: 'En cours' },
  { id: 'termine', label: 'Terminés' },
]
const activeTab = ref('tous')

const difficultyLabel = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile' }
const difficultyVariant = { facile: 'success', moyen: 'warning', difficile: 'danger' }
const statutLabel = { 'a-faire': 'À faire', 'en-cours': 'En cours', termine: 'Terminé' }

const exercises = ref([])
const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    exercises.value = await getStudentExercises()
  } catch (error) {
    loadError.value = 'Impossible de charger les exercices.'
  } finally {
    isLoading.value = false
  }
})

const filteredExercises = computed(() => {
  if (activeTab.value === 'tous') return exercises.value
  return exercises.value.filter((exercise) => exercise.statut === activeTab.value)
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>