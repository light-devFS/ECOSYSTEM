<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ADMINISTRATION" title="Tableau de bord" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <div>
            <h2>{{ dashboard.etablissement }}</h2>
            <p class="text-muted">Vue d'ensemble de l'établissement.</p>
          </div>

          <div class="stat-grid">
            <StatCard label="Eleves inscrits" :value="dashboard.stats.elevesInscrits" />
            <StatCard label="Enseignants" :value="dashboard.stats.enseignants" />
            <StatCard label="Classes" :value="dashboard.stats.classes" :caption="dashboard.stats.classesCaption" />
            <StatCard label="Usage hors-ligne" :value="dashboard.stats.usageHorsLigne" />
          </div>

          <div class="panel-grid">
            <section class="panel">
              <h3 class="panel__title">Indicateurs d'impact</h3>
              <div class="alert-list">
                <div v-for="indicateur in dashboard.indicateurs" :key="indicateur.id" class="alert-row metric-row">
                  <div>
                    <p class="alert-row__title">{{ indicateur.titre }}</p>
                    <p class="alert-row__description">{{ indicateur.description }}</p>
                  </div>
                  <span class="metric-value">{{ indicateur.valeur }}</span>
                </div>
              </div>
            </section>

            <section class="panel">
              <h3 class="panel__title">Alertes administratives</h3>
              <div class="alert-list">
                <div v-for="alerte in dashboard.alertes" :key="alerte.id" class="alert-row">
                  <div>
                    <p class="alert-row__title">{{ alerte.titre }}</p>
                    <p class="alert-row__description">{{ alerte.description }}</p>
                  </div>
                  <BaseBadge :label="alerte.label" :variant="alerte.variant" />
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
import StatCard from '@/components/dashboard/StatCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import { getAdminDashboard } from '@/services/admin/adminDashboardService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { adminNavItems } from '@/config/nav/adminNavItems'

const router = useRouter()
const session = useSession()
const navItems = adminNavItems
const userName = computed(() => session.user?.name || 'Administration')

const dashboard = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  dashboard.value = await getAdminDashboard()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>