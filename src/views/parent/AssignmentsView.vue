<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PARENT" title="Devoirs & échéances" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Devoirs & échéances</h2>
        </div>

        <section class="panel">
          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <table v-else-if="assignments.length" class="task-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Titre</th>
                <th>Échéance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="devoir in assignments" :key="devoir.id">
                <td>{{ devoir.matiere }}</td>
                <td>{{ devoir.titre }}</td>
                <td>{{ devoir.echeance }}</td>
                <td><BaseBadge :label="statutLabel[devoir.statut]" variant="neutral" /></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucun devoir à venir.</p>
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
import BaseBadge from '@/components/base/BaseBadge.vue'
import { getAssignments } from '@/services/parent/parentAssignmentsService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { parentNavItems } from '@/config/nav/parentNavItems'

const router = useRouter()
const session = useSession()
const navItems = parentNavItems
const userName = computed(() => session.user?.name || 'Parent')

const statutLabel = { 'a-faire': 'À faire', 'en-cours': 'En cours' }

const assignments = ref([])
const isLoading = ref(true)

onMounted(async () => {
  assignments.value = await getAssignments()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>