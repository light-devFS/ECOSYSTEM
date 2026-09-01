<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" title="Devoirs & Evaluations" :show-notifications="false" />

      <div class="app-shell__content">
        <div class="page-heading">
          <div>
            <h2>Devoirs & Evaluations</h2>
            <p class="text-muted">Créez, suivez et corrigez les devoirs et évaluations de vos classes.</p>
          </div>
          <BaseButton @click="isCreateModalOpen = true">Créer un devoir</BaseButton>
        </div>

        <section class="panel">
          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <table v-else-if="devoirs.length" class="task-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Classe</th>
                <th>Type</th>
                <th>Delai</th>
                <th>Rendus</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="devoir in devoirs" :key="devoir.id">
                <td>{{ devoir.titre }}</td>
                <td>{{ devoir.classe }}</td>
                <td>{{ devoir.type }}</td>
                <td>{{ devoir.delai }}</td>
                <td>{{ devoir.rendus }}</td>
                <td><BaseBadge :label="statutLabel[devoir.statut]" :variant="statutVariant[devoir.statut]" /></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucun devoir pour le moment.</p>
        </section>
      </div>
    </div>

    <BaseModal v-model="isCreateModalOpen" title="Nouveau devoir">
      <form @submit.prevent="handleSubmitCreate">
        <BaseInput v-model="form.titre" label="Titre" />
        <BaseSelect v-model="form.classe" label="Classe" stacked :options="classeOptions" />
        <BaseSelect v-model="form.type" label="Type" stacked :options="typeOptions" />
        <BaseInput v-model="form.delai" label="Delai" placeholder="jj/mm/aa" />
        <BaseButton type="submit">Creer</BaseButton>
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
import { getProfDevoirs } from '@/services/professeur/profDevoirsService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const statutLabel = { 'en-correction': 'En correction', 'a-corriger': 'A corriger', termine: 'Terminer' }
const statutVariant = { 'en-correction': 'warning', 'a-corriger': 'danger', termine: 'success' }

const devoirs = ref([])
const isLoading = ref(true)

onMounted(async () => {
  devoirs.value = await getProfDevoirs()
  isLoading.value = false
})

const isCreateModalOpen = ref(false)
const form = reactive({ titre: '', classe: '', type: '', delai: '' })
const classeOptions = [
  { value: 'Terminale D', label: 'Terminale D' },
  { value: 'Terminale C', label: 'Terminale C' },
  { value: 'Premiere S', label: 'Premiere S' },
]
const typeOptions = [
  { value: 'Devoir de maison', label: 'Devoir de maison' },
  { value: 'Evaluation', label: 'Evaluation' },
  { value: 'Quiz auto-corrigé', label: 'Quiz auto-corrigé' },
]

function handleSubmitCreate() {
  if (!form.titre.trim()) return

  devoirs.value.unshift({
    id: `pd-${Date.now()}`,
    titre: form.titre.trim(),
    classe: form.classe || 'Non précisée',
    type: form.type || 'Non précisé',
    delai: form.delai || '—',
    rendus: '0 / 0',
    statut: 'a-corriger',
  })

  form.titre = ''
  form.classe = ''
  form.type = ''
  form.delai = ''
  isCreateModalOpen.value = false
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>