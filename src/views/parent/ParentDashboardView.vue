<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PARENT" title="Tableau de bord" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else>
          <div class="follow-heading">
            <div>
              <h2>Suivi de {{ dashboard.suivi.nom }}</h2>
              <p class="text-muted">{{ dashboard.suivi.niveau }} · {{ dashboard.suivi.etablissement }}</p>
            </div>
            <BaseSelect v-model="selectedEnfant" :options="enfantOptions" />
          </div>

          <div class="stat-grid">
            <StatCard label="Niveau global" :value="dashboard.stats.niveauGlobal" />
            <StatCard label="Devoirs en retard" :value="dashboard.stats.devoirsEnRetard" />
            <StatCard label="Alertes" :value="dashboard.stats.alertes" />
            <StatCard label="Tickets suivis" :value="dashboard.stats.ticketsSuivis" />
          </div>

          <section class="panel">
            <h3 class="panel__title">Alertes importantes</h3>
            <div class="alert-list">
              <div v-for="alerte in dashboard.alertesImportantes" :key="alerte.id" class="alert-row">
                <div>
                  <p class="alert-row__title">{{ alerte.titre }}</p>
                  <p class="alert-row__description">{{ alerte.description }}</p>
                </div>
                <BaseButton variant="secondary" @click="handleAlerte(alerte)">{{ alerte.action }}</BaseButton>
              </div>
            </div>
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
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getParentDashboard } from '@/services/parent/parentDashboardService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { parentNavItems } from '@/config/nav/parentNavItems'

const router = useRouter()
const session = useSession()
const navItems = parentNavItems
const userName = computed(() => session.user?.name || 'Parent')

const dashboard = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const selectedEnfant = ref('awa')

onMounted(async () => {
  try {
    dashboard.value = await getParentDashboard()
  } catch (error) {
    loadError.value = 'Impossible de charger le suivi.'
  } finally {
    isLoading.value = false
  }
})

const enfantOptions = computed(
  () => dashboard.value?.enfants.map((enfant) => ({ value: enfant.id, label: `${enfant.nom} - ${enfant.niveau}` })) || []
)

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}

function handleAlerte(alerte) {
  if (alerte.to) router.push(alerte.to)
}
</script>