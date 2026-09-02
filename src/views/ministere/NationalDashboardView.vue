<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="MINISTERE DE L'EDUCATION" title="Tableau de bord national" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <div>
            <h2>Tableau de bord national</h2>
            <p class="text-muted">Vue d'ensemble des établissements sur toute l'étendue du territoire togolais.</p>
          </div>

          <div class="stat-grid">
            <StatCard
              label="Etablissements"
              :value="dashboard.stats.etablissements"
              :caption="dashboard.stats.etablissementsCaption"
            />
            <StatCard
              label="Eleves suivis"
              :value="dashboard.stats.elevesSuivis"
              :caption="dashboard.stats.elevesSuivisCaption"
            />
            <StatCard
              label="Taux de maitrise"
              :value="dashboard.stats.tauxMaitrise"
              :caption="dashboard.stats.tauxMaitriseCaption"
            />
            <StatCard
              label="Usage hors-ligne"
              :value="dashboard.stats.usageHorsLigne"
              :caption="dashboard.stats.usageHorsLigneCaption"
            />
          </div>

          <section class="panel">
            <h3 class="panel__title">Répartition par région</h3>
            <table class="task-table">
              <thead>
                <tr>
                  <th>Région</th>
                  <th>Etablissements</th>
                  <th>Élèves</th>
                  <th>Maîtrise moyenne</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="region in dashboard.repartitionParRegion" :key="region.id">
                  <td>{{ region.region }}</td>
                  <td>{{ region.etablissements }}</td>
                  <td>{{ region.eleves }}</td>
                  <td>{{ region.maitrise }}</td>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { getNationalDashboard } from '@/services/ministere/nationalDashboardService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { ministereNavItems } from '@/config/nav/ministereNavItems'

const router = useRouter()
const session = useSession()
const navItems = ministereNavItems
const userName = computed(() => session.user?.name || 'Ministère')

const dashboard = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  dashboard.value = await getNationalDashboard()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>