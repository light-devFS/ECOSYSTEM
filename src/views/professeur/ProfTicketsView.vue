<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
<<<<<<< Updated upstream
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Tickets pédagogiques" :show-notifications="false" />

      <div class="app-shell__content">
        <p class="text-muted">Interventions demandées par vos élèves.</p>

        <BaseTabs v-model="activeTab" :tabs="tabOptions" />

        <div class="grid-2">
          <section class="panel">
            <p v-if="isLoading" class="text-muted">Chargement…</p>
            <table v-else-if="filteredTickets.length" class="task-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Notion</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ticket in filteredTickets"
                  :key="ticket.id"
                  :class="{ 'task-row--selected': ticket.id === selectedId }"
                  class="task-row"
                  @click="selectTicket(ticket.id)"
                >
                  <td>{{ ticket.eleve }}</td>
                  <td>{{ ticket.notion }}</td>
                  <td><BaseBadge :label="ticketBadge(ticket).label" :variant="ticketBadge(ticket).variant" /></td>
                </tr>
              </tbody>
            </table>
            <p v-else class="task-table__empty">Aucun ticket dans cet onglet.</p>
          </section>

          <section class="panel">
            <h3 class="panel__title">Note d'intervention</h3>
            <form class="intervention-form" @submit.prevent="handleNoter">
              <div class="field">
                <span class="field__label">Élève</span>
                <p class="readonly-value">{{ selectedTicket.eleve }}</p>
              </div>
              <div class="field">
                <span class="field__label">Notion</span>
                <p class="readonly-value">{{ selectedTicket.notion }}</p>
              </div>
              <BaseTextarea v-model="note" label="Observation" placeholder="Résumez votre intervention..." />
              <p v-if="message" class="form-success" role="status">{{ message }}</p>
              <p v-if="error" class="form-error" role="alert">{{ error }}</p>
              <div class="intervention-form__actions">
                <BaseButton type="submit" :loading="isSaving">Enregistrer et notifier</BaseButton>
                <BaseButton v-if="selectedId && !isCloture" variant="secondary" type="button" :loading="isSaving" @click="handleCloturer">
                  Clôturer
                </BaseButton>
              </div>
            </form>
          </section>
        </div>
=======
      <AppHeader eyebrow="PROFESSEUR" title="Tickets pédagogiques" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Tickets pédagogiques</h2>
          <p class="text-muted">Interventions demandées par vos élèves.</p>
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <BaseTabs v-model="activeTab" :tabs="tabs" />

          <div class="panel-grid">
            <section class="panel">
              <table v-if="filteredTickets.length" class="task-table">
                <thead>
                  <tr>
                    <th>Eleve</th>
                    <th>Notion</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ticket in filteredTickets" :key="ticket.id">
                    <td>{{ ticket.eleve }}</td>
                    <td>{{ ticket.notion }}</td>
                    <td><BaseBadge :label="statutLabel[ticket.statut]" :variant="statutVariant[ticket.statut]" /></td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="task-table__empty">Aucun ticket dans cette catégorie.</p>
            </section>

            <section class="panel">
              <h3 class="panel__title">Note d'intervention</h3>
              <form @submit.prevent="handleSubmitNote">
                <BaseInput v-model="noteForm.eleve" label="Eleve" placeholder="Entrer le nom de l'eleve" />
                <BaseInput v-model="noteForm.notion" label="Notion" placeholder="Entrer la notion" />
                <BaseTextarea
                  v-model="noteForm.observation"
                  label="Observation"
                  placeholder="Resumer votre intervention"
                />
                <BaseButton type="submit" :loading="isSaving">
                  {{ isSaving ? 'Enregistrement…' : 'Enregistrer et notifier' }}
                </BaseButton>
              </form>
            </section>
          </div>
        </template>
>>>>>>> Stashed changes
      </div>
    </div>
  </div>
</template>

<script setup>
<<<<<<< Updated upstream
import { computed, onMounted, ref } from 'vue'
=======
import { computed, onMounted, reactive, ref } from 'vue'
>>>>>>> Stashed changes
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
<<<<<<< Updated upstream
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'
import { getTicketsProf, ticketOnglet, ticketBadge, updateTicketStatut } from '@/services/prof/profDataService'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')
=======
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getProfTickets, saveIntervention } from '@/services/professeur/profTicketsService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const statutLabel = { nouveau: 'Nouveau', 'en-cours': 'Intervention', resolu: 'Resolu' }
const statutVariant = { nouveau: 'danger', 'en-cours': 'info', resolu: 'success' }
>>>>>>> Stashed changes

const tickets = ref([])
const isLoading = ref(true)
const activeTab = ref('nouveaux')
<<<<<<< Updated upstream
const selectedId = ref(null)
const note = ref('')
const isSaving = ref(false)
const message = ref('')
const error = ref('')

const tabOptions = computed(() => [
  { id: 'nouveaux', label: `Nouveaux (${countBy('nouveaux')})` },
  { id: 'encours', label: `En cours (${countBy('encours')})` },
  { id: 'resolus', label: `Résolus (${countBy('resolus')})` },
])

const filteredTickets = computed(() => tickets.value.filter((t) => ticketOnglet(t) === activeTab.value))

const selectedTicket = computed(() => {
  const found = tickets.value.find((t) => t.id === selectedId.value)
  return {
    id: found?.id || '',
    eleve: found?.eleve || '',
    notion: found?.notion || '',
  }
})

const isCloture = computed(() => {
  const found = tickets.value.find((t) => t.id === selectedId.value)
  return found?.suivi === 'cloture'
})

function countBy(onglet) {
  return tickets.value.filter((t) => ticketOnglet(t) === onglet).length
}

function selectTicket(id) {
  selectedId.value = id
  note.value = ''
  message.value = ''
  error.value = ''
}

async function loadTickets() {
  isLoading.value = true
  tickets.value = await getTicketsProf(session.user || { matiere: '', name: '' })
  if (!selectedId.value && filteredTickets.value[0]) {
    selectTicket(filteredTickets.value[0].id)
  }
  isLoading.value = false
}

async function handleNoter() {
  if (!selectedId.value) return
  isSaving.value = true
  message.value = ''
  error.value = ''
  try {
    await updateTicketStatut(selectedId.value, { suivi: 'intervention', note: note.value })
    message.value = 'Intervention enregistrée et professeur notifié.'
    note.value = ''
    await loadTickets()
  } catch (err) {
    error.value = err.message || 'Impossible d’enregistrer l’intervention.'
=======

onMounted(async () => {
  tickets.value = await getProfTickets()
  isLoading.value = false
})

const nouveauxCount = computed(() => tickets.value.filter((t) => t.statut === 'nouveau').length)
const enCoursCount = computed(() => tickets.value.filter((t) => t.statut === 'en-cours').length)

const tabs = computed(() => [
  { id: 'nouveaux', label: `Nouveaux(${nouveauxCount.value})` },
  { id: 'en-cours', label: `En cours(${enCoursCount.value})` },
  { id: 'resolus', label: 'Resolus' },
])

const statutParTab = { nouveaux: 'nouveau', 'en-cours': 'en-cours', resolus: 'resolu' }
const filteredTickets = computed(() =>
  tickets.value.filter((ticket) => ticket.statut === statutParTab[activeTab.value])
)

const isSaving = ref(false)
const noteForm = reactive({ eleve: '', notion: '', observation: '' })

async function handleSubmitNote() {
  if (!noteForm.eleve.trim() || !noteForm.notion.trim()) return

  isSaving.value = true
  try {
    await saveIntervention({ ...noteForm })
    noteForm.eleve = ''
    noteForm.notion = ''
    noteForm.observation = ''
>>>>>>> Stashed changes
  } finally {
    isSaving.value = false
  }
}

<<<<<<< Updated upstream
async function handleCloturer() {
  if (!selectedId.value) return
  isSaving.value = true
  message.value = ''
  error.value = ''
  try {
    await updateTicketStatut(selectedId.value, { suivi: 'cloture', note: note.value })
    message.value = 'Ticket clôturé.'
    note.value = ''
    await loadTickets()
  } catch (err) {
    error.value = err.message || 'Impossible de clôturer le ticket.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadTickets)

=======
>>>>>>> Stashed changes
async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
<<<<<<< Updated upstream
</script>

<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: var(--space-6);
  margin-top: var(--space-6);
  align-items: start;
}
.intervention-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.readonly-value {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--color-text-muted);
  background: var(--color-bg-muted);
  margin: 0;
}
.intervention-form__actions {
  display: flex;
  gap: var(--space-3);
}
.form-success {
  color: var(--color-success);
  font-size: var(--font-sm);
}
.form-error {
  color: var(--color-danger);
  font-size: var(--font-sm);
}
.task-row {
  cursor: pointer;
}
.task-row--selected {
  background: var(--color-accent-soft, rgba(84, 108, 226, 0.08));
}
</style>
=======
</script>
>>>>>>> Stashed changes
