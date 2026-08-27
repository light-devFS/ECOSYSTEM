<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="ADMINISTRATION" title="Emploi du temps" :show-notifications="false" />

      <div class="app-shell__content">
        <div class="content-toolbar">
          <h2>Emploi du temps</h2>
          <BaseSelect v-model="selectedClasse" :options="classeOptions" />
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <section class="panel">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="jour in schedule.jours" :key="jour">{{ jour }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="creneau in schedule.creneaux" :key="creneau || 'vide'">
                  <td>{{ creneau }}</td>
                  <td v-for="jour in schedule.jours" :key="jour"></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="panel">
            <div class="panel-header-row">
              <h3 class="panel__title">Événements à venir</h3>
              <button type="button" class="icon-button" aria-label="Ajouter un événement" @click="handleAddEvent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <div v-if="schedule.evenements.length" class="alert-list">
              <div v-for="evenement in schedule.evenements" :key="evenement.id" class="alert-row">
                <div>
                  <p class="alert-row__title">{{ evenement.titre }}</p>
                  <p class="alert-row__description">{{ evenement.date }}</p>
                </div>
              </div>
            </div>
            <p v-else class="task-table__empty">Aucun événement à venir.</p>
          </section>
        </template>
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
import { getSchedule } from '@/services/admin/adminScheduleService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { adminNavItems } from '@/config/nav/adminNavItems'

const router = useRouter()
const session = useSession()
const navItems = adminNavItems
const userName = computed(() => session.user?.name || 'Administration')

const schedule = ref({ classes: [], jours: [], creneaux: [], evenements: [] })
const isLoading = ref(true)
const selectedClasse = ref('Terminale D')

const classeOptions = computed(() => schedule.value.classes.map((classe) => ({ value: classe, label: classe })))

async function loadSchedule() {
  isLoading.value = true
  schedule.value = await getSchedule(selectedClasse.value)
  isLoading.value = false
}

onMounted(loadSchedule)
watch(selectedClasse, loadSchedule)

function handleAddEvent() {
  // Le formulaire de création d'événement sera construit à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>