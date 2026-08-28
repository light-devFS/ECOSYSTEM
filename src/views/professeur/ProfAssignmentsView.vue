<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Devoirs & évaluations" :show-notifications="false" />

      <div class="app-shell__content">
        <p class="text-muted">Créez, suivez et corrigez les devoirs et évaluations de vos classes.</p>

        <div class="actions-end">
          <BaseButton @click="isModalOpen = true">Créer un devoir</BaseButton>
        </div>

        <section class="panel">
          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <table v-else-if="rows.length" class="task-table">
            <thead>
              <tr>
                <th>TITRE</th>
                <th>CLASSE</th>
                <th>TYPE</th>
                <th>ÉCHÉANCE</th>
                <th>RENDUS</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.key">
                <td>{{ row.title }}</td>
                <td>{{ row.classe }}</td>
                <td><BaseBadge :label="row.type === 'devoir' ? 'Devoir' : 'Révisions'" :variant="row.type === 'devoir' ? 'info' : 'success'" /></td>
                <td>{{ row.dueDate }}</td>
                <td>{{ row.rendus }}/{{ row.total }}</td>
                <td><BaseBadge :label="row.statut.label" :variant="row.statut.variant" /></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucun devoir créé pour le moment.</p>
        </section>

        <BaseModal v-model="isModalOpen" title="Créer un devoir">
          <form class="stack-form" @submit.prevent="handleCreate">
            <BaseInput v-model="form.title" label="Intitulé du devoir" placeholder="Ex : Devoir de synthèse n°1" />
            <BaseSelect v-model="form.classe" label="Classe" stacked :options="classeOptions" />
            <BaseSelect v-model="form.type" label="Type" stacked :options="typeOptions" />
            <BaseInput v-model="form.dueDate" type="date" label="Date limite" />
            <p v-if="message" class="form-success" role="status">{{ message }}</p>
            <p v-if="createError" class="form-error" role="alert">{{ createError }}</p>
            <BaseButton type="submit" :loading="isCreating">Créer le devoir</BaseButton>
          </form>
        </BaseModal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'
import { getAssignmentsByCreator, createAssignmentForClass } from '@/services/assignments/assignmentService'
import { getClasses } from '@/services/admin/adminPeopleService'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')

const typeOptions = [
  { value: 'devoir', label: 'Devoir' },
  { value: 'revisions', label: 'Révisions' },
]

const form = reactive({ title: '', classe: '', type: 'devoir', dueDate: '' })
const classeOptions = ref([])
const assignments = ref([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isCreating = ref(false)
const createError = ref('')
const message = ref('')

const rows = computed(() => {
  const byKey = new Map()
  for (const assignment of assignments.value) {
    const key = `${assignment.title}|${assignment.classe}`
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        title: assignment.title,
        classe: assignment.classe,
        subject: assignment.subject,
        type: assignment.type,
        rendus: 0,
        total: 0,
        dueDateValue: assignment.dueDate ? new Date(assignment.dueDate.toDate()) : null,
      })
    }
    const row = byKey.get(key)
    row.total += 1
    if (assignment.status && assignment.status !== 'à faire') row.rendus += 1
  }
  return [...byKey.values()].map((row) => ({
    ...row,
    dueDate: row.dueDateValue ? row.dueDateValue.toLocaleDateString('fr-FR') : '—',
    statut: computeStatut(row),
  }))
})

function computeStatut(row) {
  const overdue = row.dueDateValue ? row.dueDateValue < new Date() : false
  if (overdue) return { label: 'À corriger', variant: 'danger' }
  if (row.rendus > 0) return { label: 'En correction', variant: 'warning' }
  return { label: 'En attente', variant: 'info' }
}

async function loadAssignments() {
  isLoading.value = true
  const [mesDevoirs, classes] = await Promise.all([getAssignmentsByCreator(), getClasses()])
  assignments.value = mesDevoirs
  const profClasses = session.user?.classes || []
  classeOptions.value = (profClasses.length ? profClasses : classes).map((c) => ({ value: c, label: c }))
  isLoading.value = false
}

async function handleCreate() {
  createError.value = ''
  message.value = ''
  if (!form.title.trim() || !form.classe) {
    createError.value = 'L’intitulé et la classe sont obligatoires.'
    return
  }
  isCreating.value = true
  try {
    const result = await createAssignmentForClass({
      title: form.title.trim(),
      classe: form.classe,
      type: form.type,
      subject: session.user?.matiere || 'Général',
      dueDate: form.dueDate || undefined,
    })
    form.title = ''
    form.dueDate = ''
    isModalOpen.value = false
    await loadAssignments()
    message.value = `Devoir créé — ${result.count} élève(s) concerné(s) dans ${result.classe}.`
  } catch (error) {
    createError.value = error.message || 'Impossible de créer le devoir.'
  } finally {
    isCreating.value = false
  }
}

onMounted(loadAssignments)

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>

<style scoped>
.stack-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
}
.form-error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}
</style>