<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" title="Contenus & Validation IA" :show-notifications="false" />

      <div class="app-shell__content">
        <div>
          <h2>Contenus & Validation IA</h2>
          <p class="text-muted">Importez vos ressources et validez les contenus générés par l'IA avant diffusion.</p>
        </div>

        <section class="panel">
          <span class="section-label">Importer des ressources</span>
          <div class="dropzone" @dragover.prevent @drop.prevent="handleDrop">
            <p>
              Glissez vos fichiers ici, ou
              <button type="button" class="dropzone__link" @click="triggerFilePicker">
                parcourez votre ordinateur
              </button>
            </p>
            <p>PDF, vidéos, liens et notes de cours</p>
            <input ref="fileInput" type="file" multiple hidden @change="handleFileSelect" />
          </div>
          <ul v-if="importedFiles.length" class="dropzone__files">
            <li v-for="(file, index) in importedFiles" :key="index">{{ file }}</li>
          </ul>
        </section>

        <section class="panel">
          <div class="panel-header-row">
            <h3 class="panel__title">Contenus générés par l'IA en attente de validation</h3>
            <BaseBadge :label="`${contenus.length} en attente`" variant="warning" />
          </div>

          <p v-if="isLoading" class="text-muted">Chargement…</p>
          <table v-else-if="contenus.length" class="task-table">
            <thead>
              <tr>
                <th>Notion</th>
                <th>Type</th>
                <th>Aperçu</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contenu in contenus" :key="contenu.id">
                <td>{{ contenu.notion }}</td>
                <td>{{ contenu.type }}</td>
                <td>« {{ contenu.apercu }} »</td>
                <td class="task-table__action">
                  <div class="actions-inline">
                    <BaseButton @click="handleValider(contenu)">Valider</BaseButton>
                    <BaseButton variant="secondary" @click="handleModifier(contenu)">Modifier</BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucun contenu en attente de validation.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ContenusIAView (professeur)
 * L'import de fichiers reste local pour l'instant (juste la liste des
 * noms sélectionnés) : aucun stockage réel tant que Firebase Storage
 * n'est pas branché côté backend.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getContenusIA } from '@/services/professeur/contenusIAService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const contenus = ref([])
const isLoading = ref(true)

onMounted(async () => {
  contenus.value = await getContenusIA()
  isLoading.value = false
})

const fileInput = ref(null)
const importedFiles = ref([])

function triggerFilePicker() {
  fileInput.value?.click()
}

function addFiles(fileList) {
  importedFiles.value.push(...Array.from(fileList).map((file) => file.name))
}

function handleFileSelect(event) {
  addFiles(event.target.files)
}

function handleDrop(event) {
  addFiles(event.dataTransfer.files)
}

function handleValider(contenu) {
  contenus.value = contenus.value.filter((item) => item.id !== contenu.id)
}

function handleModifier(contenu) {
  // L'éditeur du contenu généré (contenu.id) sera construit à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>