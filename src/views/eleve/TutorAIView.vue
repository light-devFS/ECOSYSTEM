<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE ÉLÈVE" title="Tuteur IA" :notifications-count="2" />

      <div class="app-shell__content">
        <div>
          <h2>Tuteur IA</h2>
          <p class="text-muted">
            Contextualisé à ton chapitre en cours. Il privilégie les indices et le raisonnement
            plutôt que la réponse directe.
          </p>
        </div>

        <div class="tutor-layout">
          <aside class="tutor-history">
            <p class="tutor-history__title">
              Historiques
              <span>…</span>
            </p>
            <button
              v-for="item in history"
              :key="item.id"
              type="button"
              class="tutor-history__item"
            >
              {{ item.titre }}
            </button>
          </aside>

          <section class="tutor-chat">
            <div class="tutor-chat__messages">
              <p v-if="!messages.length" class="tutor-chat__placeholder">
                Expose moi tes imcompréhensions!!
              </p>
              <p
                v-for="message in messages"
                :key="message.id"
                class="tutor-chat__message"
                :class="`tutor-chat__message--${message.author}`"
              >
                {{ message.text }}
              </p>
            </div>

            <form class="tutor-chat__form" @submit.prevent="handleSend">
              <BaseInput
                v-model="draft"
                placeholder="Ecris ta reponse...."
                :disabled="isSending"
              />
              <BaseButton type="submit" :loading="isSending" :disabled="!draft.trim()">
                Envoyer
              </BaseButton>
            </form>
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
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getHistory, sendMessage } from '@/services/tutor/tutorService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const history = ref([])
const messages = ref([])
const draft = ref('')
const isSending = ref(false)

onMounted(async () => {
  history.value = await getHistory()
})

async function handleSend() {
  const text = draft.value.trim()
  if (!text) return

  messages.value.push({ id: `q-${Date.now()}`, author: 'eleve', text })
  draft.value = ''
  isSending.value = true

  try {
    const reply = await sendMessage(text)
    messages.value.push(reply)
  } finally {
    isSending.value = false
  }
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>