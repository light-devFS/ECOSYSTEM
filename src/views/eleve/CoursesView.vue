<template>
  <div class="app-shell">
    <AppSidebar :nav-items="navItems" :user-name="userName" @logout="handleLogout" />

    <div class="app-shell__main">
      <AppHeader
        eyebrow="ESPACE ÉLÈVE"
        title="Mes cours"
        :notifications-count="2"
        searchable
        search-placeholder="Rechercher un cours ou une matière..."
        v-model:search-value="searchTerm"
      />

      <div class="app-shell__content">
        <p v-if="isLoading" class="text-muted">Chargement des cours…</p>
        <p v-else-if="loadError" class="form-error" role="alert">{{ loadError }}</p>

        <template v-else>
          <div>
            <h2>Mes cours</h2>
            <p class="text-muted">Retrouve tes cours et continue ton apprentissage</p>
          </div>

          <div class="content-toolbar">
            <span />
            <BaseSelect v-model="selectedMatiere" :options="matiereOptions" />
          </div>

          <div v-if="filteredCourses.length" class="course-grid">
            <CourseCard
              v-for="course in filteredCourses"
              :key="course.id"
              :course="course"
              @open="handleOpen"
            />
          </div>
          <p v-else class="task-table__empty">Aucun cours ne correspond à ta recherche.</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * CoursesView (élève)
 * Filtrage par matière et par recherche fait côté client sur les
 * données de courseService — suffisant tant que le volume de cours
 * reste faible. À revoir (filtrage serveur) si la liste grandit
 * beaucoup une fois Firestore branché.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import CourseCard from '@/components/education/CourseCard.vue'
import { getStudentCourses } from '@/services/courses/courseService'
import { useSession, clearCurrentUser } from '@/services/auth/session'
import { logout } from '@/services/auth/authService'
import { eleveNavItems } from '@/config/nav/eleveNavItems'

const router = useRouter()
const session = useSession()
const navItems = eleveNavItems
const userName = computed(() => session.user?.name || 'Élève')

const courses = ref([])
const isLoading = ref(true)
const loadError = ref('')
const searchTerm = ref('')
const selectedMatiere = ref('toutes')

onMounted(async () => {
  try {
    courses.value = await getStudentCourses()
  } catch (error) {
    loadError.value = 'Impossible de charger tes cours.'
  } finally {
    isLoading.value = false
  }
})

const matiereOptions = computed(() => [
  { value: 'toutes', label: 'Toutes les matières' },
  ...courses.value.map((course) => ({ value: course.matiere, label: course.matiere })),
])

const filteredCourses = computed(() =>
  courses.value.filter((course) => {
    const matchesMatiere =
      selectedMatiere.value === 'toutes' || course.matiere === selectedMatiere.value
    const matchesSearch = course.matiere.toLowerCase().includes(searchTerm.value.toLowerCase())
    return matchesMatiere && matchesSearch
  })
)

function handleOpen(course) {
  // La page de détail d'un cours (course.id) sera construite à la prochaine maquette.
}

async function handleLogout() {
  await logout()
  clearCurrentUser()
  router.push('/connexion')
}
</script>