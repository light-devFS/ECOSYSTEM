<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" :title="chapter ? chapter.chapitre : 'Chapitre'" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>
        <p v-else-if="!chapter" class="form-error" role="alert">Ce chapitre est introuvable.</p>

        <template v-else>
          <div>
            <router-link to="/professeur/programme" class="back-link">← Retour au programme</router-link>
            <h2>{{ chapter.chapitre }}</h2>
            <div class="chapter-meta">
              <span>{{ chapter.matiere }}</span>
              <span>·</span>
              <span>{{ chapter.niveau }}</span>
              <BaseBadge :label="statutLabel[chapter.statut]" :variant="statutVariant[chapter.statut]" />
            </div>
          </div>

          <section class="panel">
            <h3 class="panel__title">Exercices générés par l'IA</h3>
            <table v-if="chapter.exercices.length" class="task-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Aperçu</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exercice in chapter.exercices" :key="exercice.id">
                  <td>{{ exercice.titre }}</td>
                  <td>{{ exercice.type }}</td>
                  <td>« {{ exercice.apercu }} »</td>
                  <td><BaseBadge label="Validé" variant="success" /></td>
                  <td class="task-table__action">
                    <div class="actions-inline">
                      <BaseButton variant="secondary" @click="handleViewExercice(exercice)">Voir</BaseButton>
                      <BaseButton variant="secondary" @click="handleEditExercice(exercice)">Modifier</BaseButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="task-table__empty">Aucun exercice généré pour ce chapitre.</p>
          </section>

          <section class="panel">
            <div class="panel-header-row">
              <h3 class="panel__title">Séances planifiées</h3>
              <button type="button" class="icon-button" aria-label="Planifier une séance" @click="handleAddSeance">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div v-if="chapter.seances.length" class="alert-list">
              <div v-for="seance in chapter.seances" :key="seance.id" class="alert-row">
                <div>
                  <p class="alert-row__title">{{ seance.titre }}</p>
                  <p class="alert-row__description">{{ seance.date }}</p>
                </div>
              </div>
            </div>
            <p v-else class="task-table__empty">Aucune séance planifiée pour ce chapitre.</p>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getChapterDetail } from '@/services/professeur/chapterDetailService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const route = useRoute()
const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const statutLabel = { planifie: 'Planifié', 'en-cours': 'En cours', termine: 'Terminé' }
const statutVariant = { planifie: 'info', 'en-cours': 'warning', termine: 'success' }

const chapter = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  chapter.value = await getChapterDetail(route.params.id)
  isLoading.value = false
})

function handleViewExercice(exercice) {
  // L'aperçu détaillé de l'exercice (exercice.id) sera construit à la prochaine maquette.
}

function handleEditExercice(exercice) {
  // L'éditeur de l'exercice (exercice.id) sera construit à la prochaine maquette.
}

function handleAddSeance() {
  // Le formulaire de planification d'une séance sera construit à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>