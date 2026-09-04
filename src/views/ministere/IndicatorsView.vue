<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader eyebrow="MINISTERE DE L'EDUCATION" title="Indicateurs par établissement" :show-notifications="false" />

      <div class="app-shell__content">
        <div class="content-toolbar">
          <div>
            <h2>Indicateurs par établissement</h2>
            <p class="text-muted">Données agrégées uniquement, aucun accès aux résultats individuels des élèves.</p>
          </div>
          <BaseSelect v-model="selectedRegion" :options="regionOptions" />
        </div>

        <p v-if="isLoading" class="text-muted">Chargement…</p>

        <section v-else class="panel">
          <table v-if="etablissements.length" class="task-table">
            <thead>
              <tr>
                <th>Etablissements</th>
                <th>Élèves</th>
                <th>Maîtrise moyenne</th>
                <th>Tickets Résolus</th>
                <th>Usage Hors-ligne</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="etablissement in etablissements" :key="etablissement.id">
                <td>{{ etablissement.nom }}</td>
                <td>{{ etablissement.eleves }}</td>
                <td>{{ etablissement.maitrise }}</td>
                <td>{{ etablissement.ticketsResolus }}</td>
                <td>{{ etablissement.usageHorsLigne }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="task-table__empty">Aucune donnée pour cette région pour le moment.</p>
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
import { getIndicators } from '@/services/ministere/indicatorsService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { ministereNavItems } from '@/config/nav/ministereNavItems'

const router = useRouter()
const session = useSession()
const navItems = ministereNavItems
const userName = computed(() => session.user?.name || 'Ministère')

const regions = ref([])
const etablissements = ref([])
const isLoading = ref(true)
const selectedRegion = ref('Maritime')

const regionOptions = computed(() => regions.value.map((region) => ({ value: region, label: region })))

async function loadIndicators() {
  isLoading.value = true
  const result = await getIndicators(selectedRegion.value)
  regions.value = result.regions
  etablissements.value = result.etablissements
  isLoading.value = false
}

onMounted(loadIndicators)
watch(selectedRegion, loadIndicators)

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>