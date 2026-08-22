<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Mes tickets" :notifications-count="2" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement des tickets…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else>
          <div class="page-heading">
            <div>
              <h2>Mes tickets</h2>
              <p class="text-muted">
                Le pont entre l'accompagnement automatisé et l'intervention humaine.
              </p>
            </div>
            <BaseButton @click="handleCreateTicket">Nouveau ticket</BaseButton>
          </div>

          <div class="panel-grid">
            <section class="panel">
              <h3 class="panel__title">Requêtes éffectuées</h3>
              <table v-if="tickets.length" class="task-table">
                <thead>
                  <tr>
                    <th>Notion</th>
                    <th>Matière</th>
                    <th>Statut</th>
                    <th>Professeur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="ticket in tickets"
                    :key="ticket.id"
                    class="task-table__row--clickable"
                    :class="{ 'task-table__row--selected': ticket.id === selectedTicketId }"
                    @click="selectedTicketId = ticket.id"
                  >
                    <td>{{ ticket.notion }}</td>
                    <td>{{ ticket.matiere }}</td>
                    <td>
                      <BaseBadge :label="statutLabel[ticket.statut]" :variant="statutVariant[ticket.statut]" />
                    </td>
                    <td>{{ ticket.professeur }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="task-table__empty">Aucune requête pour le moment.</p>
            </section>

            <section v-if="selectedTicket" class="panel">
              <h3 class="panel__title">Ticket — {{ selectedTicket.notion }}</h3>
              <VerticalTimeline :steps="selectedTicket.timeline" />
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
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import VerticalTimeline from '@/components/base/VerticalTimeline.vue'
import { getTickets } from '@/services/tickets/ticketService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const statutLabel = { 'en-cours': 'En cours', resolu: 'Résolu' }
const statutVariant = { 'en-cours': 'warning', resolu: 'success' }

const tickets = ref([])
const isLoading = ref(true)
const loadError = ref('')
const selectedTicketId = ref(null)

onMounted(async () => {
  try {
    tickets.value = await getTickets()
    selectedTicketId.value = tickets.value[0]?.id || null
  } catch (error) {
    loadError.value = 'Impossible de charger tes tickets.'
  } finally {
    isLoading.value = false
  }
})

const selectedTicket = computed(() =>
  tickets.value.find((ticket) => ticket.id === selectedTicketId.value)
)

function handleCreateTicket() {
  // Le formulaire de création de ticket sera construit à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>