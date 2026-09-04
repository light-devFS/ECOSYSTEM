<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
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

const tickets = ref([])
const isLoading = ref(true)
const activeTab = ref('nouveaux')

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
  } finally {
    isSaving.value = false
  }
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>