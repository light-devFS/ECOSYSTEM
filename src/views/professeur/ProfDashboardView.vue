<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Tableau de bord" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <div>
            <h2>Bonjour {{ userName }}</h2>
            <p class="text-muted">Vue d'ensemble de vos classes{{ session.user?.matiere ? ` de ${session.user.matiere}` : '' }}.</p>
          </div>

          <div class="stat-grid">
            <StatCard label="Classes actives" :value="dashboard.classesActives" :caption="classesList" />
            <StatCard label="Compréhension moyenne" :value="`${dashboard.comprehensionMoyenne}%`" caption="+0 pt cette semaine" />
            <StatCard label="Devoirs à corriger" :value="dashboard.devoirsACorriger" :caption="dashboard.devoirsCaption" />
            <StatCard label="Tickets en attente" :value="dashboard.ticketsEnAttente" :caption="`${dashboard.urgents} urgent(s)`" />
          </div>

          <div class="panel-grid">
            <section class="panel">
              <h3 class="panel__title">
                Alertes de compréhension
                <RouterLink class="panel__link" to="/professeur/comprehension">Voir tout</RouterLink>
              </h3>
              <div class="alert-list">
                <div v-if="!dashboard.alertes.length" class="task-table__empty">Aucune alerte pour le moment.</div>
                <div v-for="alerte in dashboard.alertes" :key="alerte.competence" class="alert-row">
                  <div>
                    <p class="alert-row__title">{{ alerte.competence }}</p>
                    <p class="alert-row__description">{{ alerte.libelle }}</p>
                  </div>
                  <BaseBadge :label="alerte.badge.label" :variant="alerte.badge.variant" />
                </div>
              </div>
            </section>

            <section class="panel">
              <h3 class="panel__title">
                Devoirs à corriger
                <RouterLink class="panel__link" to="/professeur/devoirs">Voir tout</RouterLink>
              </h3>
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr>
                      <th>DEVOIR</th>
                      <th>CLASSE</th>
                      <th>RENDUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in devoirsEnCours" :key="row.key">
                      <td class="cell-strong">{{ row.title }}</td>
                      <td>{{ row.classe }}</td>
                      <td>{{ row.rendus }}/{{ row.total }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="!devoirsEnCours.length" class="task-table__empty">Aucun devoir à corriger.</p>
              </div>
            </section>
          </div>

          <section class="panel mt-panel">
            <h3 class="panel__title">Mes classes</h3>
            <div v-if="classesMaitrise.length" class="class-grid">
              <div v-for="classe in classesMaitrise" :key="classe.classe" class="class-card">
                <p class="class-card__title">{{ classe.classe }}</p>
                <p class="class-card__sub">{{ classe.eleves }} élève(s)</p>
                <ProgressBar label="Maîtrise moyenne" :percent="classe.moyenne" :color="progressColor(classe.moyenne)" />
              </div>
            </div>
            <p v-else class="task-table__empty">Aucune classe avec des données de progression pour le moment.</p>
          </section>
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
import StatCard from '@/components/dashboard/StatCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'
import { getProfDashboard, getMaitriseParClasse } from '@/services/prof/profDataService'
import { getAssignmentsByCreator } from '@/services/assignments/assignmentService'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')

const dashboard = ref({})
const classesMaitrise = ref([])
const devoirsEnCours = ref([])
const isLoading = ref(true)

const classesList = computed(() => (session.user?.classes || []).join(', '))

function progressColor(percent) {
  return percent >= 75 ? 'success' : percent >= 50 ? 'warning' : 'danger'
}

async function load() {
  const dashboardData = await getProfDashboard(session.user)
  const [classes, assignments] = await Promise.all([
    getMaitriseParClasse(session.user),
    getAssignmentsByCreator(),
  ])
  dashboard.value = dashboardData
  classesMaitrise.value = classes
  const regroup = new Map()
  for (const assignment of assignments) {
    const key = `${assignment.title}|${assignment.classe}`
    if (!regroup.has(key)) {
      regroup.set(key, { key, title: assignment.title, classe: assignment.classe, rendus: 0, total: 0 })
    }
    const row = regroup.get(key)
    row.total += 1
    if (assignment.status && assignment.status !== 'à faire') row.rendus += 1
  }
  devoirsEnCours.value = [...regroup.values()].slice(0, 3)
  isLoading.value = false
}

onMounted(load)

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>

<style scoped>
.panel__link {
  margin-left: auto;
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
}
.mt-panel {
  margin-top: var(--space-4);
}
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
.class-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--space-4);
}
.class-card__title {
  margin: 0;
  font-weight: var(--font-weight-semibold);
}
.class-card__sub {
  margin: var(--space-2) 0 var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>