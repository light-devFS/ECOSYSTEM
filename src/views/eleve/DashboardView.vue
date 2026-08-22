<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Tableau de bord" :notifications-count="2" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement du tableau de bord…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else-if="dashboard">
          <div class="dashboard-greeting">
            <h2>Bonjour {{ firstName }}</h2>
            <p class="text-muted">Voici où en est la progression cette semaine.</p>
          </div>

          <div class="stat-grid">
            <StatCard label="Devoirs à rendre" :value="dashboard.stats.devoirsARendre" />
            <StatCard label="Progression" :value="`${dashboard.stats.progression}%`" />
            <StatCard label="Matière à reviser" :value="dashboard.stats.matiereAReviser" />
            <StatCard label="Streak" :value="`${dashboard.stats.streakJours} j`" />
          </div>

          <div class="panel-grid">
            <section class="panel">
              <h3 class="panel__title">Mes progres</h3>
              <ProgressBar
                v-for="subject in dashboard.subjectsProgress"
                :key="subject.label"
                :label="subject.label"
                :percent="subject.percent"
                :color="subject.color"
              />
            </section>

            <section class="panel tutor-panel">
              <h3 class="panel__title">Tuteur IA</h3>
              <p class="tutor-panel__difficulty-label">Difficulté détectée :</p>
              <p class="tutor-panel__difficulty-value">
                {{ dashboard.tuteurIA.difficulteDetectee }}
              </p>
              <p class="tutor-panel__mastery">Maîtrise : {{ dashboard.tuteurIA.maitrise }}%</p>
              <BaseButton variant="secondary">Commencer</BaseButton>
            </section>
          </div>

          <section class="panel">
            <h3 class="panel__title">À faire prochainement</h3>
            <table v-if="dashboard.tachesAVenir.length" class="task-table">
              <tbody>
                <tr v-for="tache in dashboard.tachesAVenir" :key="tache.id">
                  <td>{{ tache.matiere }}</td>
                  <td>{{ tache.type }} — {{ tache.titre }}</td>
                  <td>{{ tache.date }}</td>
                  <td class="task-table__action">
                    <BaseButton variant="secondary">Démarrer</BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="task-table__empty">Rien à faire pour le moment.</p>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * DashboardView (élève)
 * Les données viennent de dashboardService, lui-même branché sur
 * mock/dashboard.js en attendant Firestore.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getStudentDashboard } from '@/services/dashboard/dashboardService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()

const navItems = eleveNavItems

const userName = computed(() => session.user?.name || 'Élève')
const firstName = computed(() => userName.value.split(' ')[0])

const dashboard = ref(null)
const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    dashboard.value = await getStudentDashboard()
  } catch (error) {
    loadError.value = 'Impossible de charger le tableau de bord.'
  } finally {
    isLoading.value = false
  }
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>