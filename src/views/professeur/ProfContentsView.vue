<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Contenus & validation IA" :show-notifications="false" />

      <div class="app-shell__content">
        <p class="text-muted">Importez vos ressources et validez les contenus générés par l'IA avant diffusion.</p>
        <BaseBadge label="Interface de démonstration — la génération IA et le dépôt de fichiers seront connectés" variant="neutral" />

        <section class="panel mt-panel">
          <h3 class="panel__title">Importer des ressources</h3>
          <button type="button" class="dropzone" @click="handleImport">
            <span>Glissez vos fichiers ici, ou <strong>parcourez votre ordinateur</strong></span>
            <span class="small muted">PDF, vidéos, liens et notes de cours</span>
          </button>
        </section>

        <section class="panel mt-panel">
          <div class="panel__head">
            <h3 class="panel__title">Contenus générés par l'IA en attente de validation</h3>
            <BaseBadge :label="`${enAttente.length} en attente`" variant="warning" />
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Notion</th>
                  <th>Type</th>
                  <th>Aperçu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="contenu in enAttente" :key="contenu.id">
                  <td class="cell-strong">{{ contenu.notion }}</td>
                  <td>{{ contenu.type }}</td>
                  <td class="small muted">{{ contenu.percu }}</td>
                  <td class="content-actions">
                    <BaseButton @click="valider(contenu)">Valider</BaseButton>
                    <BaseButton variant="secondary" @click="modifier(contenu)">Modifier</BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!enAttente.length" class="task-table__empty">Tous les contenus ont été traités. Bravo !</p>
          </div>
        </section>

        <p v-if="message" class="form-success mt-panel" role="status">{{ message }}</p>

        <div class="notice mt-panel">Toute génération de l'IA reste soumise à validation humaine avant d'être diffusée aux élèves.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')

const contenus = ref([
  {
    id: 'c1',
    notion: 'Suites géométriques',
    type: "Série d'exercices (5)",
    percu: "« Détermine la raison de la suite définie par... »",
  },
  {
    id: 'c2',
    notion: 'Dérivées composées',
    type: 'Explication alternative',
    percu: "« Reprenons la règle de la chaîne à l'aide d'un exemple concret... »",
  },
  {
    id: 'c3',
    notion: 'Probabilités',
    type: 'Quiz de révision',
    percu: "« 8 questions à choix multiples, difficulté progressive »",
  },
])
const enAttente = computed(() => contenus.value.filter((c) => !c.traite))
const message = ref('')

function valider(contenu) {
  contenu.traite = true
  message.value = `« ${contenu.notion} » validé et diffusé aux élèves.`
}

function modifier(contenu) {
  message.value = `« ${contenu.notion} » mis en file de modification (générateur IA à connecter).`
}

function handleImport() {
  message.value = 'Le dépôt de fichiers sera connecté au stockage Firebase. Mutation pour plus tard.'
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>

<style scoped>
.mt-panel {
  margin-top: var(--space-4);
}
.dropzone {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-6);
  border: 2px dashed var(--border);
  border-radius: 8px;
  background: var(--color-bg-muted);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}
.dropzone:hover {
  border-color: var(--color-primary);
}
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel__head .panel__title {
  margin: 0;
}
.content-actions {
  display: flex;
  gap: var(--space-2);
}
.small {
  font-size: var(--font-size-sm);
}
.muted {
  color: var(--color-text-muted);
}
.form-success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
}
.notice {
  padding: var(--space-3) var(--space-4);
  border-radius: 7px;
  background: rgba(224, 165, 60, 0.12);
  color: #a06a1c;
  font-size: var(--font-size-sm);
}
</style>