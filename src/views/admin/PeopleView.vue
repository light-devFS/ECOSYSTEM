<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ADMINISTRATION" title="Eleves & Enseignants" :show-notifications="false" />

      <div class="app-shell__content">
        <div class="page-heading">
          <h2>Eleves & Enseignants</h2>
          <BaseButton @click="handleAdd">Ajouter</BaseButton>
        </div>

        <section class="panel">
          <BaseTabs v-model="activeTab" :tabs="tabs" />

          <input
            v-model="searchTerm"
            type="search"
            class="search-input"
            :placeholder="activeTab === 'eleves' ? 'Rechercher un eleve....' : 'Rechercher un enseignant....'"
          />

          <p v-if="isLoading" class="text-muted">Chargement…</p>

          <table v-else-if="activeTab === 'eleves' && filteredEleves.length" class="task-table">
            <thead>
              <tr>
                <th>NOM</th>
                <th>CLASSE</th>
                <th>MOYENNE</th>
                <th>STATUT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="eleve in filteredEleves" :key="eleve.id">
                <td>{{ eleve.nom }}</td>
                <td>{{ eleve.classe }}</td>
                <td>{{ eleve.moyenne }}</td>
                <td><BaseBadge :label="statutLabel[eleve.statut]" :variant="statutVariant[eleve.statut]" /></td>
                <td class="task-table__action">
                  <button type="button" class="icon-button" aria-label="Modifier l'élève" @click="openEditEleve(eleve)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <table v-else-if="activeTab === 'enseignants' && filteredEnseignants.length" class="task-table">
            <thead>
              <tr>
                <th>NOM</th>
                <th>MATIERE</th>
                <th>CLASSES</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="enseignant in filteredEnseignants" :key="enseignant.id">
                <td>{{ enseignant.nom }}</td>
                <td>{{ enseignant.matiere }}</td>
                <td>{{ enseignant.classes }}</td>
                <td><BaseBadge label="Actif" variant="success" /></td>
              </tr>
            </tbody>
          </table>

          <p v-else class="task-table__empty">Aucun résultat.</p>
        </section>
      </div>
    </div>

    <BaseModal v-model="isCreateModalOpen" title="Nouvel eleve">
      <form @submit.prevent="handleSubmitCreate">
        <BaseInput v-model="createForm.nom" label="Nom & Prenoms" />
        <BaseInput v-model="createForm.email" type="email" label="E-mail" />
        <BaseSelect v-model="createForm.classe" label="Classe" stacked :options="classeOptions" />
        <BaseButton type="submit">Creer</BaseButton>
      </form>
    </BaseModal>

    <BaseModal v-model="isEditModalOpen" title="Modification">
      <form @submit.prevent="handleSubmitEdit">
        <BaseInput v-model="editForm.nom" label="Nom & Prenoms" />
        <BaseInput v-model="editForm.email" type="email" label="E-mail" />
        <BaseSelect v-model="editForm.classe" label="Classe" stacked :options="classeOptions" />
        <BaseSelect v-model="editForm.statut" label="Statut du compte" stacked :options="statutOptions" />
        <BaseButton type="submit">Modifier</BaseButton>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
/**
 * PeopleView (administration)
 * Le filtrage par recherche est fait côté client sur les données déjà
 * chargées — à revoir pour un filtrage serveur si le volume grandit
 * beaucoup une fois Firestore branché.
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import { getEleves, getEnseignants } from '@/services/admin/adminPeopleService'
import { mockClasses } from '@/mock/adminPeople'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { adminNavItems } from '@/config/nav/adminNavItems'

const router = useRouter()
const session = useSession()
const navItems = adminNavItems
const userName = computed(() => session.user?.name || 'Administration')

const statutLabel = { actif: 'Actif', inactif: 'Inactif' }
const statutVariant = { actif: 'success', inactif: 'neutral' }
const statutOptions = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
]
const classeOptions = mockClasses.map((classe) => ({ value: classe, label: classe }))

const tabs = [
  { id: 'eleves', label: 'Eleves' },
  { id: 'enseignants', label: 'Enseignants' },
]
const activeTab = ref('eleves')
const searchTerm = ref('')

const eleves = ref([])
const enseignants = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const [elevesResult, enseignantsResult] = await Promise.all([getEleves(), getEnseignants()])
  eleves.value = elevesResult
  enseignants.value = enseignantsResult
  isLoading.value = false
})

const filteredEleves = computed(() =>
  eleves.value.filter((eleve) => eleve.nom.toLowerCase().includes(searchTerm.value.toLowerCase()))
)

const filteredEnseignants = computed(() =>
  enseignants.value.filter((enseignant) =>
    enseignant.nom.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

const isCreateModalOpen = ref(false)
const createForm = reactive({ nom: '', email: '', classe: '' })

function handleAdd() {
  if (activeTab.value === 'eleves') {
    createForm.nom = ''
    createForm.email = ''
    createForm.classe = ''
    isCreateModalOpen.value = true
  }
  // L'ajout d'un enseignant sera construit à la prochaine maquette.
}

function handleSubmitCreate() {
  if (!createForm.nom.trim()) return

  eleves.value.unshift({
    id: `el-${Date.now()}`,
    nom: createForm.nom.trim(),
    email: createForm.email.trim(),
    classe: createForm.classe,
    moyenne: '— / 20',
    statut: 'actif',
  })

  isCreateModalOpen.value = false
}

const isEditModalOpen = ref(false)
const editForm = reactive({ id: '', nom: '', email: '', classe: '', statut: 'actif' })

function openEditEleve(eleve) {
  editForm.id = eleve.id
  editForm.nom = eleve.nom
  editForm.email = eleve.email
  editForm.classe = eleve.classe
  editForm.statut = eleve.statut
  isEditModalOpen.value = true
}

function handleSubmitEdit() {
  const eleve = eleves.value.find((candidate) => candidate.id === editForm.id)
  if (!eleve) return

  eleve.nom = editForm.nom.trim()
  eleve.email = editForm.email.trim()
  eleve.classe = editForm.classe
  eleve.statut = editForm.statut

  isEditModalOpen.value = false
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>