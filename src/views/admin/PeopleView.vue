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
              </tr>
            </thead>
            <tbody>
              <tr v-for="eleve in filteredEleves" :key="eleve.id">
                <td>{{ eleve.nom }}</td>
                <td>{{ eleve.classe }}</td>
                <td>{{ eleve.moyenne }}</td>
                <td><BaseBadge label="Actif" variant="success" /></td>
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
  </div>
</template>

<script setup>
/**
 * PeopleView (administration)
 * Le filtrage par recherche est fait côté client sur les données déjà
 * chargées — à revoir pour un filtrage serveur si le volume grandit
 * beaucoup une fois Firestore branché.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import { getEleves, getEnseignants } from '@/services/admin/adminPeopleService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { adminNavItems } from '@/config/nav/adminNavItems'

const router = useRouter()
const session = useSession()
const navItems = adminNavItems
const userName = computed(() => session.user?.name || 'Administration')

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

function handleAdd() {
  // Le formulaire d'ajout (élève ou enseignant selon l'onglet actif) sera construit à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>