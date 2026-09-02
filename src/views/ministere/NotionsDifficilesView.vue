<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="MINISTERE DE L'EDUCATION" title="Notions difficiles" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Notions difficiles</h2>
          <p class="text-muted">Analyse nationale des notions les moins maîtrisées.</p>
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <section v-else class="panel">
          <div v-for="notion in notions" :key="notion.id" class="notion-row">
            <div class="notion-row__top">
              <div class="notion-row__meta">
                <span>{{ notion.nom }}</span>
              </div>
            </div>
            <p class="notion-row__difficulte">
              {{ notion.matiere }} · {{ notion.niveau }} · {{ notion.etablissements }} établissements concernés
            </p>
            <div class="notion-row__track">
              <div class="progress-row__track">
                <div
                  class="progress-row__fill"
                  :style="{ width: `${notion.maitrise}%`, backgroundColor: `var(--color-${notion.color})` }"
                />
              </div>
              <span class="notion-row__maitrise">{{ notion.maitrise }}%</span>
            </div>
          </div>
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
import { getNotionsDifficiles } from '@/services/ministere/notionsDifficilesService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { ministereNavItems } from '@/config/nav/ministereNavItems'

const router = useRouter()
const session = useSession()
const navItems = ministereNavItems
const userName = computed(() => session.user?.name || 'Ministère')

const notions = ref([])
const isLoading = ref(true)

onMounted(async () => {
  notions.value = await getNotionsDifficiles()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>