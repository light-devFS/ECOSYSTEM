<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PARENT" title="Messagerie" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Messagerie</h2>
          <p class="text-muted">Communication structurée et modérée avec l'établissement.</p>
          <p class="text-muted">
            Les échanges sont encadrés par l'établissement : ils restent centrés sur le suivi
            pédagogique de votre enfant.
          </p>
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>
        <div v-else class="panel-grid">
          <section class="panel">
            <h3 class="panel__title panel__title--centered">Enseignants</h3>
            <div v-if="enseignantMessages.length" class="alert-list">
              <div v-for="message in enseignantMessages" :key="message.id" class="alert-row">
                <div>
                  <p class="alert-row__title">{{ message.auteur }}</p>
                  <p class="alert-row__description" v-if="message.role">{{ message.role }}</p>
                  <p class="alert-row__description">« {{ message.extrait }} »</p>
                </div>
                <BaseBadge :label="message.lu ? 'Lu' : 'Non lu'" :variant="message.lu ? 'info' : 'danger'" />
              </div>
            </div>
            <p v-else class="task-table__empty">Aucun message des enseignants.</p>
          </section>

          <section class="panel">
            <h3 class="panel__title panel__title--centered">Administration</h3>
            <div v-if="administrationMessages.length" class="alert-list">
              <div v-for="message in administrationMessages" :key="message.id" class="alert-row">
                <div>
                  <p class="alert-row__description">« {{ message.extrait }} »</p>
                </div>
                <BaseBadge :label="message.lu ? 'Lu' : 'Non lu'" :variant="message.lu ? 'info' : 'danger'" />
              </div>
            </div>
            <p v-else class="task-table__empty">Aucun message de l'administration.</p>
          </section>
        </div>
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
import { getMessages } from '@/services/parent/parentMessagingService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { parentNavItems } from '@/config/nav/parentNavItems'

const router = useRouter()
const session = useSession()
const navItems = parentNavItems
const userName = computed(() => session.user?.name || 'Parent')

const messages = ref([])
const isLoading = ref(true)

onMounted(async () => {
  messages.value = await getMessages()
  isLoading.value = false
})

const enseignantMessages = computed(() => messages.value.filter((m) => m.categorie === 'enseignant'))
const administrationMessages = computed(() => messages.value.filter((m) => m.categorie === 'administration'))

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>