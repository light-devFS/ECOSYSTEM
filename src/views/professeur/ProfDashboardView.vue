<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="PROFESSEUR" title="Tableau de bord" :show-notifications="false" />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <template v-else>
          <div>
            <h2>Bonjour {{ greetingName }}</h2>
            <p class="text-muted">Vue d'ensemble de vos classes.</p>
          </div>

          <div class="stat-grid">
            <StatCard
              label="Classes actives"
              :value="dashboard.stats.classesActives"
              :caption="dashboard.stats.classesActivesCaption"
            />
            <StatCard label="Comprehension moy" :value="dashboard.stats.comprehensionMoyenne" />
            <StatCard
              label="Devoirs a corriger"
              :value="dashboard.stats.devoirsACorriger"
              :caption="dashboard.stats.devoirsACorrigerCaption"
            />
            <StatCard
              label="Tickets en attente"
              :value="dashboard.stats.ticketsEnAttente"
              :caption="dashboard.stats.ticketsEnAttenteCaption"
            />
          </div>

          <div class="panel-grid">
            <section class="panel">
              <div class="panel-header-row">
                <h3 class="panel__title">Alertes de compréhension</h3>
                <router-link to="/professeur/comprehension" class="text-sm">Voir tout</router-link>
              </div>
              <div class="alert-list">
                <div v-for="alerte in dashboard.alertesComprehension" :key="alerte.id" class="alert-row">
                  <div>
                    <p class="alert-row__title">{{ alerte.titre }}</p>
                    <p class="alert-row__description">{{ alerte.description }}</p>
                  </div>
                  <BaseBadge :label="alerte.label" :variant="alerte.variant" />
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel-header-row">
                <h3 class="panel__title">Devoirs à corriger</h3>
                <router-link to="/professeur/devoirs" class="text-sm">Voir tout</router-link>
              </div>
              <table class="task-table">
                <thead>
                  <tr>
                    <th>Devoir</th>
                    <th>Classe</th>
                    <th>Rendus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="devoir in dashboard.devoirsACorrigerListe" :key="devoir.id">
                    <td>{{ devoir.devoir }}</td>
                    <td>{{ devoir.classe }}</td>
                    <td>{{ devoir.rendus }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <section class="panel">
            <h3 class="panel__title">Mes classes</h3>
            <div class="classes-grid">
              <div v-for="classe in dashboard.mesClasses" :key="classe.id">
                <p class="classes-grid__name">{{ classe.nom }}</p>
                <p class="classes-grid__count">{{ classe.eleves }} élèves</p>
                <ProgressBar label="Maîtrise moyenne" :percent="classe.maitrise" :color="classe.color" />
              </div>
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import { getProfDashboard } from '@/services/professeur/profDashboardService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { professeurNavItems } from '@/config/nav/professeurNavItems'

const router = useRouter()
const session = useSession()
const navItems = professeurNavItems
const userName = computed(() => session.user?.name || 'Professeur')

/**
 * "M. Kodjo Aziaka" -> "M. Aziaka" : titre de civilité + nom de famille,
 * pour matcher le format de salutation court de la maquette.
 */
const greetingName = computed(() => {
  const parts = userName.value.split(' ')
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : userName.value
})

const dashboard = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  dashboard.value = await getProfDashboard()
  isLoading.value = false
})

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>