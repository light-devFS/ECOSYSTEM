<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Compréhension de la classe" :show-notifications="false" />

      <div class="app-shell__content">
        <p class="text-muted">{{ comprehensionIntro }}</p>

        <section class="panel">
          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <div v-else-if="notions.length" class="comprehension-list">
            <div v-for="notion in notions" :key="notion.competence" class="comprehension-row">
              <div class="comprehension-row__head">
                <div class="comprehension-row__title">{{ notion.competence }}</div>
                <div class="comprehension-row__meta">
                  <span class="small muted">{{ notion.classe }} · {{ notion.enDifficulte }}/{{ notion.total }} élèves en difficulté</span>
                  <BaseBadge :label="prioriteLabel(notion.priorite)" :variant="notion.priorite" />
                  <BaseButton @click="createGroupe(notion)">Créer un ticket groupé</BaseButton>
                </div>
              </div>
              <ProgressBar label="Maîtrise moyenne" :percent="notion.moyenne" :color="progressColor(notion.moyenne)" />
            </div>
          </div>
          <p v-else class="task-table__empty">Aucune donnée de progression pour vos matières pour le moment.</p>
        </section>

        <p v-if="message" class="form-success" role="status">{{ message }}</p>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
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
import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'
import { getComprehensionClasses, createGroupeTicket } from '@/services/prof/profDataService'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')

const notions = ref([])
const isLoading = ref(true)
const message = ref('')
const error = ref('')

const comprehensionIntro = computed(() => {
  const classes = (session.user?.classes || []).join(', ')
  return `Détection des notions problématiques${classes ? ` — ${classes}` : ''}.`
})

function prioriteLabel(priorite) {
  return { danger: 'Prioritaire', warning: 'À surveiller', info: 'Stable' }[priorite] || 'Stable'
}

function progressColor(percent) {
  return percent >= 75 ? 'success' : percent >= 50 ? 'warning' : 'danger'
}

async function load() {
  isLoading.value = true
  const data = await getComprehensionClasses(session.user)
  notions.value = data.notions
  isLoading.value = false
}

async function createGroupe(notion) {
  message.value = ''
  error.value = ''
  try {
    const result = await createGroupeTicket({
      notion: notion.competence,
      classe: notion.classe.split(', ')[0],
      matiere: session.user?.matiere || 'Général',
    })
    message.value = `Ticket groupé créé pour « ${result.notion} » (${result.classe}).`
    await load()
  } catch (err) {
    error.value = err.message || 'Impossible de créer le ticket groupé.'
  }
}

onMounted(load)

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>

<style scoped>
.comprehension-list {
  display: flex;
  flex-direction: column;
}
.comprehension-row {
  border-bottom: 1px solid var(--border);
  padding: var(--space-4) 0;
}
.comprehension-row:last-child {
  border-bottom: none;
}
.comprehension-row__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}
.comprehension-row__title {
  font-weight: var(--font-weight-semibold);
}
.comprehension-row__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.small {
  font-size: var(--font-size-sm);
}
.muted {
  color: var(--color-text-muted);
}
.form-success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  margin-top: var(--space-4);
}
.form-error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--space-4);
}
</style>