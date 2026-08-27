<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ADMINISTRATION" title="Statistiques" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Statistiques</h2>
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <div class="stat-grid">
            <StatCard label="Régularité des révisions" :value="statistics.stats.regulariteRevisions" />
            <StatCard label="Participation à l'entraide" :value="statistics.stats.participationEntraide" />
            <StatCard label="Progression après intervention" :value="statistics.stats.progressionApresIntervention" />
          </div>

          <section class="panel">
            <h3 class="panel__title">Maîtrise moyenne par matière</h3>
            <ProgressBar
              v-for="item in statistics.maitriseParMatiere"
              :key="item.matiere"
              :label="item.matiere"
              :percent="item.percent"
              :color="item.color"
            />
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
import ProgressBar from '@/components/base/ProgressBar.vue'
import { getStatistics } from '@/services/admin/adminStatisticsService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { adminNavItems } from '@/config/nav/adminNavItems'

const router = useRouter()
const session = useSession()
const navItems = adminNavItems
const userName = computed(() => session.user?.name || 'Administration')

const statistics = ref({ stats: {}, maitriseParMatiere: [] })
const isLoading = ref(true)

onMounted(async () => {
  statistics.value = await getStatistics()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>