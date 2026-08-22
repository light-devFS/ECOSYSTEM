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
            <BaseButton @click="handleCreateGroup">Créer un groupe</BaseButton>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import GroupCard from '@/components/education/GroupCard.vue'
import AiSuggestionCard from '@/components/education/AiSuggestionCard.vue'
import { getGroups, getAiSuggestion } from '@/services/groups/groupService'
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

function handleCreateGroup() {
  // Le formulaire de création de groupe sera construit à la prochaine maquette.
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