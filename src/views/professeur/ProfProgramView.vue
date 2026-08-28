<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ESPACE PROFESSEUR" title="Programme & planification" :show-notifications="false" />

      <div class="app-shell__content">
        <p class="text-muted">Programme officiel par pays, niveau et matière, et planification des séances.</p>

        <p v-if="notice" class="notice" role="status">{{ notice }}</p>
        <BaseBadge label="Données démo — la souscription au programme officiel sera connectée prochainement" variant="neutral" />

        <section class="panel mt-panel">
          <div class="grid-4-filtres">
            <BaseSelect label="Pays" stacked v-model="filters.pays" :options="paysOptions" />
            <BaseSelect label="Niveau" stacked v-model="filters.niveau" :options="niveauOptions" />
            <BaseSelect label="Matière" stacked v-model="filters.matiere" :options="matiereOptions" />
            <BaseSelect label="Version du référentiel" stacked v-model="filters.version" :options="versionOptions" />
          </div>
        </section>

        <section class="panel mt-panel">
          <h3 class="panel__title">Chapitres du programme</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Chapitre</th>
                  <th>Statut</th>
                  <th>Contenus IA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="chapitre in chapitres" :key="chapitre.titre">
                  <td class="cell-strong">{{ chapitre.titre }}</td>
                  <td><BaseBadge :label="chapitre.statut" :variant="statusTone[chapitre.statut]" /></td>
                  <td>{{ chapitre.contenus }}</td>
                  <td><BaseButton variant="secondary" @click="ouvrirChapitre(chapitre)">Ouvrir</BaseButton></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { profNavItems } from '@/config/nav/profNavItems'

const router = useRouter()
const session = useSession()
const navItems = profNavItems
const userName = computed(() => session.user?.name?.split(' ')[0] || 'Professeur')

const filters = reactive({
  pays: 'Togo',
  niveau: 'Terminale D',
  matiere: 'Mathématiques',
  version: '2025 — v3',
})

const paysOptions = [{ value: 'Togo', label: 'Togo' }]
const niveauOptions = [{ value: 'Terminale D', label: 'Terminale D' }, { value: 'Première S', label: 'Première S' }]
const matiereOptions = [{ value: 'Mathématiques', label: 'Mathématiques' }]
const versionOptions = [{ value: '2025 — v3', label: '2025 — v3' }]

const statusTone = { Planifié: 'info', 'En cours': 'warning', Terminé: 'success', 'À planifier': 'neutral' }

const chapitres = ref([
  { titre: 'Suites numériques', statut: 'Planifié', contenus: 'Exercices IA validés' },
  { titre: 'Fonctions et dérivées', statut: 'En cours', contenus: 'Exercices IA validés' },
  { titre: 'Probabilités conditionnelles', statut: 'Terminé', contenus: 'Exercices IA validés' },
  { titre: "Géométrie dans l'espace", statut: 'À planifier', contenus: 'En attente de validation' },
])

const notice = ref('')

function ouvrirChapitre(chapitre) {
  notice.value = `Détail du chapitre « ${chapitre.titre} » — contenu démo à connecter avec la souscription au programme officiel.`
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
.grid-4-filtres {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.notice {
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}
</style>