<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PARENT" title="Evolution par matiere" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>
        <section v-else class="panel">
          <h3 class="panel__title">Evolution par matiere</h3>
          <ProgressBar
            v-for="item in evolution"
            :key="item.matiere"
            :label="item.matiere"
            :percent="item.percent"
            :color="item.color"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import { getEvolution } from '@/services/parent/parentEvolutionService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { parentNavItems } from '@/config/nav/parentNavItems'

const router = useRouter()
const session = useSession()
const navItems = parentNavItems
const userName = computed(() => session.user?.name || 'Parent')

const evolution = ref([])
const isLoading = ref(true)

onMounted(async () => {
  evolution.value = await getEvolution()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>