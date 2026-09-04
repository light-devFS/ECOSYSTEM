<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" :title="contenu ? contenu.notion : 'Contenu'" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>
        <p v-else-if="!contenu" class="form-error" role="alert">Ce contenu est introuvable.</p>

        <template v-else>
          <div>
            <router-link to="/professeur/contenus" class="back-link">← Retour aux contenus</router-link>
            <h2>Modifier le contenu</h2>
            <div class="chapter-meta">
              <span>{{ contenu.notion }}</span>
              <span>·</span>
              <span>{{ contenu.type }}</span>
            </div>
          </div>

          <section class="panel">
            <form @submit.prevent="handleSave">
              <BaseInput v-model="form.notion" label="Notion" />
              <BaseInput v-model="form.type" label="Type" />
              <BaseTextarea v-model="form.contenuComplet" label="Contenu généré" :rows="8" />

              <p v-if="saveMessage" class="text-muted text-sm">{{ saveMessage }}</p>

              <div class="actions-inline">
                <BaseButton type="submit" :loading="isSaving">
                  {{ isSaving ? 'Enregistrement…' : 'Enregistrer' }}
                </BaseButton>
                <BaseButton variant="secondary" type="button" @click="handleValiderEtRevenir">
                  Valider et revenir
                </BaseButton>
              </div>
            </form>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ContentEditorView (professeur)
 * Modifie le même objet que celui lu par ContenusIAView (via
 * contenusIAService), donc les changements sont visibles en revenant
 * sur la liste — sans backend derrière pour l'instant.
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getContenuById, updateContenu } from '@/services/professeur/contenusIAService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const route = useRoute()
const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const contenu = ref(null)
const isLoading = ref(true)
const form = reactive({ notion: '', type: '', contenuComplet: '' })

onMounted(async () => {
  contenu.value = await getContenuById(route.params.id)
  if (contenu.value) {
    form.notion = contenu.value.notion
    form.type = contenu.value.type
    form.contenuComplet = contenu.value.contenuComplet
  }
  isLoading.value = false
})

const isSaving = ref(false)
const saveMessage = ref('')

async function handleSave() {
  isSaving.value = true
  saveMessage.value = ''
  try {
    await updateContenu(route.params.id, { ...form })
    saveMessage.value = 'Modifications enregistrées.'
  } finally {
    isSaving.value = false
  }
}

async function handleValiderEtRevenir() {
  await updateContenu(route.params.id, { ...form })
  router.push('/professeur/contenus')
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>