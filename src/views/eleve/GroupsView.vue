<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Groupes" :notifications-count="2" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement des groupes…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else>
          <div class="page-heading">
            <div>
              <h2>Groupes d'entraide</h2>
              <p class="text-muted">
                Rejoins un groupe permanent ou accepte une proposition d'aide de l'IA.
              </p>
            </div>
            <BaseButton @click="isCreateModalOpen = true">Créer un groupe</BaseButton>
          </div>

          <div class="panel-grid">
            <div class="panel-stack">
              <GroupCard v-for="group in groups" :key="group.id" :group="group" @open="handleOpenGroup" />
            </div>

            <section class="panel">
              <h3 class="panel__title">Proposé par l'IA</h3>
              <AiSuggestionCard
                v-if="aiSuggestion"
                :suggestion="aiSuggestion"
                @accept="handleAcceptSuggestion"
                @decline="handleDeclineSuggestion"
              />
              <p v-else class="text-muted text-sm">Aucune proposition pour le moment.</p>
            </section>
          </div>
        </template>
      </div>
    </div>

    <BaseModal v-model="isCreateModalOpen" title="Nouveau groupe">
      <form @submit.prevent="handleSubmitGroup">
        <BaseInput v-model="form.nom" label="Nom du groupe :" />
        <BaseSelect
          v-model="form.membres"
          label="Membres du groupe :"
          multiple
          stacked
          :options="membreOptions"
        />
        <BaseSelect v-model="form.matiere" label="Matiere" stacked :options="matiereOptions" />
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
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import GroupCard from '@/components/education/GroupCard.vue'
import AiSuggestionCard from '@/components/education/AiSuggestionCard.vue'
import { getGroups, getAiSuggestion } from '@/services/groups/groupService'
import { mockClassmates, mockGroupMatieres } from '@/mock/groups'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const groups = ref([])
const aiSuggestion = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const isCreateModalOpen = ref(false)
const form = reactive({ nom: '', membres: [], matiere: '' })
const membreOptions = mockClassmates.map((nom) => ({ value: nom, label: nom }))
const matiereOptions = mockGroupMatieres.map((matiere) => ({ value: matiere, label: matiere }))

onMounted(async () => {
  try {
    const [groupsResult, suggestionResult] = await Promise.all([getGroups(), getAiSuggestion()])
    groups.value = groupsResult
    aiSuggestion.value = suggestionResult
  } catch (error) {
    loadError.value = 'Impossible de charger les groupes.'
  } finally {
    isLoading.value = false
  }
})

function handleOpenGroup(group) {
  // La page de détail d'un groupe (group.id) sera construite à la prochaine maquette.
}

function handleSubmitGroup() {
  if (!form.nom.trim()) return

  groups.value.unshift({
    id: `g-${Date.now()}`,
    titre: form.nom.trim(),
    matiere: form.matiere || 'Non précisée',
    membres: form.membres.length,
    description: `Membres : ${form.membres.join(', ') || 'aucun pour le moment'}.`,
  })

  form.nom = ''
  form.membres = []
  form.matiere = ''
  isCreateModalOpen.value = false
}

function handleAcceptSuggestion() {
  if (!aiSuggestion.value) return
  groups.value.unshift({
    id: aiSuggestion.value.id,
    titre: aiSuggestion.value.titre,
    matiere: aiSuggestion.value.matiere,
    membres: 3,
    description: aiSuggestion.value.description,
  })
  aiSuggestion.value = null
}

function handleDeclineSuggestion() {
  aiSuggestion.value = null
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>