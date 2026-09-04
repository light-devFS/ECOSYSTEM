<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="MINISTERE DE L'EDUCATION" title="Programmes officiels" :show-notifications="false" />

      <div class="app-shell__content">
        <div class="content-toolbar">
          <div>
            <h2>Programmes officiels</h2>
            <p class="text-muted">Référentiels et versions par niveau et matière.</p>
          </div>
          <BaseSelect v-model="selectedNiveau" :options="niveauOptions" />
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <div v-else class="course-grid">
          <ProgramCard
            v-for="matiere in programmes.matieres"
            :key="matiere.id"
            :matiere="matiere"
            @view="handleView"
            @publish="handlePublish"
          />
        </div>
      </div>
    </div>

    <BaseModal v-model="isPublishModalOpen" title="Nouvelle version">
      <div class="dropzone" @dragover.prevent @drop.prevent="handleDrop">
        <p>
          Glissez vos fichiers ici, ou
          <button type="button" class="dropzone__link" @click="triggerFilePicker">
            parcourez votre ordinateur
          </button>
        </p>
        <p>PDF</p>
        <input ref="fileInput" type="file" accept="application/pdf" multiple hidden @change="handleFileSelect" />
      </div>
      <ul v-if="selectedFiles.length" class="dropzone__files">
        <li v-for="(file, index) in selectedFiles" :key="index">{{ file }}</li>
      </ul>
      <BaseButton :loading="isPublishing" @click="handleConfirmPublish">
        {{ isPublishing ? 'Publication…' : 'Publier' }}
      </BaseButton>
    </BaseModal>
  </div>
</template>

<script setup>
/**
 * OfficialProgramsView (ministère)
 * L'import de fichiers reste local pour l'instant (juste la liste des
 * noms sélectionnés) : aucun stockage réel tant que Firebase Storage
 * n'est pas branché côté backend.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProgramCard from '@/components/education/ProgramCard.vue'
import { getOfficialPrograms, publishProgramVersion } from '@/services/ministere/officialProgramsService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { ministereNavItems } from '@/config/nav/ministereNavItems'

const router = useRouter()
const session = useSession()
const navItems = ministereNavItems
const userName = computed(() => session.user?.name || 'Ministère')

const programmes = ref({ niveaux: [], matieres: [] })
const isLoading = ref(true)
const selectedNiveau = ref('Terminale D')

const niveauOptions = computed(() => programmes.value.niveaux.map((niveau) => ({ value: niveau, label: niveau })))

onMounted(async () => {
  programmes.value = await getOfficialPrograms(selectedNiveau.value)
  isLoading.value = false
})

function handleView(matiere) {
  // La page détaillée du programme (matiere.id) sera construite à la prochaine maquette.
}

const isPublishModalOpen = ref(false)
const publishingMatiere = ref(null)
const fileInput = ref(null)
const selectedFiles = ref([])
const isPublishing = ref(false)

function handlePublish(matiere) {
  publishingMatiere.value = matiere
  selectedFiles.value = []
  isPublishModalOpen.value = true
}

function triggerFilePicker() {
  fileInput.value?.click()
}

function addFiles(fileList) {
  selectedFiles.value.push(...Array.from(fileList).map((file) => file.name))
}

function handleFileSelect(event) {
  addFiles(event.target.files)
}

function handleDrop(event) {
  addFiles(event.dataTransfer.files)
}

async function handleConfirmPublish() {
  if (!publishingMatiere.value || !selectedFiles.value.length) return

  isPublishing.value = true
  try {
    await publishProgramVersion(publishingMatiere.value.id, selectedFiles.value)
    isPublishModalOpen.value = false
  } finally {
    isPublishing.value = false
  }
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>