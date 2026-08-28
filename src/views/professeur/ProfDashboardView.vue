<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Tableau de bord" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Bonjour {{ userName }}</h2>
          <p class="text-muted">
            {{ session.user?.matiere ? `Vous enseignez ${session.user.matiere}.` : '' }}
            {{ classeCount }} classe(s) en charge.
          </p>
        </div>

        <div class="panel-grid">
          <section class="panel">
            <h3 class="panel__title">Créer un devoir pour une classe</h3>
            <form class="stack-form" @submit.prevent="handleCreate">
              <BaseInput v-model="form.title" label="Intitulé du devoir" placeholder="Ex : Devoir de synthèse n°1" />
              <BaseSelect v-model="form.classe" label="Classe" stacked :options="classeOptions" />
              <BaseSelect v-model="form.type" label="Type" stacked :options="typeOptions" />
              <BaseInput v-model="form.dueDate" type="date" label="Date limite" />
              <p v-if="createError" class="form-error" role="alert">{{ createError }}</p>
              <BaseButton type="submit" :loading="isCreating">Créer le devoir</BaseButton>
            </form>
          </section>

          <section class="panel">
            <h3 class="panel__title">Devoirs créés</h3>
            <p v-if="isLoading" class="text-muted">Chargement…</p>
            <table v-else-if="groupedAssignments.length" class="task-table">
              <thead>
                <tr>
                  <th>TITRE</th>
                  <th>CLASSE</th>
                  <th>MATIÈRE</th>
                  <th>TYPE</th>
                  <th>ÉLÈVES</th>
                  <th>ÉCHÉANCE</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in groupedAssignments" :key="row.key">
                  <td>{{ row.title }}</td>
                  <td>{{ row.classe }}</td>
                  <td>{{ row.subject }}</td>
                  <td><BaseBadge :label="row.type === 'devoir' ? 'Devoir' : 'Révisions'" :variant="row.type === 'devoir' ? 'info' : 'success'" /></td>
                  <td>{{ row.students }}</td>
                  <td>{{ row.dueDate }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="task-table__empty">Aucun devoir créé pour le moment.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ProfDashboardView — espace professeur réel.
 * Lit les devoirs créés (Firestore) et en crée pour toute une classe
 * via la fonction backend createAssignment.
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'
import { getClasses } from '@/services/admin/adminPeopleService'
import { getAssignmentsByCreator, createAssignmentForClass } from '@/services/assignments/assignmentService'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')
const profClasses = computed(() => session.user?.classes || [])
const classeCount = computed(() => (session.user?.classes || []).length || 0)

const typeOptions = [
  { value: 'devoir', label: 'Devoir' },
  { value: 'revisions', label: 'Révisions' },
]

const form = reactive({ title: '', classe: '', type: 'devoir', dueDate: '' })
const classeOptions = ref([])
const assignments = ref([])
const isLoading = ref(true)
const isCreating = ref(false)
const createError = ref('')

onMounted(async () => {
  const [classes, mesDevoirs] = await Promise.all([getClasses(), getAssignmentsByCreator()])
  classeOptions.value = (profClasses.value.length ? profClasses.value : classes).map((c) => ({
    value: c,
    label: c,
  }))
  assignments.value = mesDevoirs
  isLoading.value = false
})

const groupedAssignments = computed(() => {
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
        students: 0,
        dueDate: formatDate(assignment.dueDate),
      })
    }
    const row = byKey.get(key)
    row.students += 1
  }
  return [...byKey.values()]
})

function formatDate(value) {
  if (!value) return '—'
  if (typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('fr-FR')
  }
  if (value instanceof Date) return value.toLocaleDateString('fr-FR')
  return String(value).slice(0, 10)
}

async function handleCreate() {
  createError.value = ''
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
    assignments.value = await getAssignmentsByCreator()
    form.title = ''
    form.dueDate = ''
    alert(`${result.count} élève(s) concerné(s) dans ${result.classe}.`)
  } catch (error) {
    createError.value = error.message || 'Impossible de créer le devoir.'
  } finally {
    isCreating.value = false
  }
}

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
</style>