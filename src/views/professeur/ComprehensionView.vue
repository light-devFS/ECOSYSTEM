<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" title="Comprehension de la classe" :show-notifications="false" />

      <div class="app-shell__content">
        <div class="content-toolbar">
          <div>
            <h2>Comprehension de la classe</h2>
            <p class="text-muted">Détection des notions problématiques.</p>
          </div>
          <BaseSelect v-model="selectedClasse" :options="classeOptions" />
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <section v-else class="panel">
          <div v-for="notion in comprehension.notions" :key="notion.id" class="notion-row">
            <div class="notion-row__top">
              <div class="notion-row__meta">
                <span>{{ notion.nom }}</span>
                <span class="notion-row__difficulte">{{ notion.pourcentageDifficulte }}% en difficulté</span>
              </div>
              <div class="notion-row__action">
                <BaseButton variant="secondary" @click="handleCreateGroupTicket(notion)">
                  Créer un ticket groupé
                </BaseButton>
              </div>
            </div>
            <div class="notion-row__track">
              <div class="progress-row__track">
                <div
                  class="progress-row__fill"
                  :style="{ width: `${notion.maitrise}%`, backgroundColor: `var(--color-${notion.color})` }"
                />
              </div>
              <span class="notion-row__maitrise">{{ notion.maitrise }}%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getComprehension } from '@/services/professeur/comprehensionService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

const comprehension = ref({ classes: [], notions: [] })
const isLoading = ref(true)
const selectedClasse = ref('Terminale D')

const classeOptions = computed(() =>
  comprehension.value.classes.map((classe) => ({ value: classe, label: classe }))
)

async function loadComprehension() {
  isLoading.value = true
  comprehension.value = await getComprehension(selectedClasse.value)
  isLoading.value = false
}

onMounted(loadComprehension)
watch(selectedClasse, loadComprehension)

function handleCreateGroupTicket(notion) {
  // Le formulaire de création de ticket groupé (notion.id) sera construit à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>