<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader
        eyebrow="ADMINISTRATION"
        title="Supervision des tickets"
        :show-notifications="false"
        searchable
        search-placeholder="Rechercher un eleve...."
        v-model:search-value="filters.recherche"
      />

      <div class="app-shell__content">
        <div>
          <h2>Supervision des tickets</h2>
        </div>

        <div class="filter-bar">
          <BaseSelect label="Statut" stacked v-model="filters.statut" :options="statutOptions" />
          <BaseSelect label="Classe" stacked v-model="filters.classe" :options="classeOptions" />
          <BaseSelect label="Priorité" stacked v-model="filters.priorite" :options="prioriteOptions" />
        </div>

        <section class="panel">
          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <table v-else-if="tickets.length" class="task-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Notion</th>
                <th>Classe</th>
                <th>Statut</th>
                <th>Priorité</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.id">
                <td>{{ ticket.eleve }}</td>
                <td>{{ ticket.notion }}</td>
                <td>{{ ticket.classe }}</td>
                <td><BaseBadge :label="statutLabel[ticket.statut]" :variant="statutVariant[ticket.statut]" /></td>
                <td><BaseBadge :label="prioriteLabel[ticket.priorite]" :variant="prioriteVariant[ticket.priorite]" /></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucun ticket ne correspond à ces filtres.</p>
        </section>

        <div class="actions-end">
          <BaseButton @click="handleOpenMessaging">Messagerie</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getTicketsSupervision } from '@/services/admin/adminTicketsSupervisionService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { adminNavItems } from '@/config/nav/adminNavItems'

const router = useRouter()
const session = useSession()
const navItems = adminNavItems
const userName = computed(() => session.user?.name || 'Administration')

const statutLabel = { intervention: 'Intervention', 'sans-reponse': 'Sans reponse(5j)', nouveau: 'Nouveau' }
const statutVariant = { intervention: 'success', 'sans-reponse': 'danger', nouveau: 'warning' }
const prioriteLabel = { normale: 'Normale', urgent: 'Urgent' }
const prioriteVariant = { normale: 'info', urgent: 'danger' }

const statutOptions = [
  { value: 'tous', label: 'Tous' },
  { value: 'intervention', label: 'Intervention' },
  { value: 'sans-reponse', label: 'Sans reponse(5j)' },
  { value: 'nouveau', label: 'Nouveau' },
]
const classeOptions = [
  { value: 'toutes', label: 'Toutes' },
  { value: 'Terminale D', label: 'Terminale D' },
  { value: 'Première S', label: 'Première S' },
]
const prioriteOptions = [
  { value: 'toutes', label: 'Toutes' },
  { value: 'normale', label: 'Normale' },
  { value: 'urgent', label: 'Urgent' },
]

const filters = reactive({ statut: 'tous', classe: 'toutes', priorite: 'toutes', recherche: '' })
const tickets = ref([])
const isLoading = ref(true)

async function loadTickets() {
  isLoading.value = true
  tickets.value = await getTicketsSupervision(filters)
  isLoading.value = false
}

onMounted(loadTickets)
watch(filters, loadTickets)

function handleOpenMessaging() {
  // La messagerie administration (contenu de la page) sera construite à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>