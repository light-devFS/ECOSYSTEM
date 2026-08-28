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
            <BaseButton @click="isCreateModalOpen = true">Nouveau ticket</BaseButton>
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

    <BaseModal v-model="isCreateModalOpen" title="Nouveau ticket">
      <form @submit.prevent="handleSubmitTicket">
        <BaseInput v-model="form.notion" label="Notion" />
        <BaseSelect v-model="form.destinataire" label="Destinataire" stacked :options="professorOptions" />
        <BaseSelect v-model="form.matiere" label="Matiere" stacked :options="matiereOptions" />
        <BaseTextarea v-model="form.description" label="Description" placeholder="Decrit tes imcomprehensions" />
        <BaseButton type="submit">Envoyer</BaseButton>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import VerticalTimeline from '@/components/base/VerticalTimeline.vue'
import { getTickets } from '@/services/tickets/ticketService'
import { mockProfessors, mockTicketMatieres } from '@/mock/tickets'
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

const isCreateModalOpen = ref(false)
const form = reactive({ notion: '', destinataire: '', matiere: '', description: '' })
const professorOptions = mockProfessors.map((nom) => ({ value: nom, label: nom }))
const matiereOptions = mockTicketMatieres.map((matiere) => ({ value: matiere, label: matiere }))

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

function handleSubmitTicket() {
  if (!form.notion.trim()) return

  const newTicket = {
    id: `t-${Date.now()}`,
    notion: form.notion.trim(),
    matiere: form.matiere || 'Non précisée',
    statut: 'en-cours',
    professeur: form.destinataire || 'Non assigné',
    timeline: [
      {
        id: 'creation',
        label: 'Création',
        description: `Ticket lié à la notion « ${form.notion.trim()} ».`,
        statut: 'fait',
      },
      {
        id: 'notification',
        label: 'Notification',
        description: form.destinataire ? `${form.destinataire} a été alerté.` : 'En attente',
        statut: form.destinataire ? 'fait' : 'attente',
      },
      { id: 'intervention', label: 'Intervention', description: 'En attente', statut: 'attente' },
      { id: 'suivi', label: 'Suivi', description: 'En attente', statut: 'attente' },
      { id: 'validation', label: 'Validation', description: 'En attente', statut: 'attente' },
      { id: 'cloture', label: 'Clôture', description: 'En attente', statut: 'attente' },
    ],
  }

  tickets.value.unshift(newTicket)
  selectedTicketId.value = newTicket.id

  form.notion = ''
  form.destinataire = ''
  form.matiere = ''
  form.description = ''
  isCreateModalOpen.value = false
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>