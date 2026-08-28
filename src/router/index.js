import { createRouter, createWebHistory } from 'vue-router'

/**
 * Les routes sont organisées par profil (eleve, parent, professeur,
 * admin, ministere). Cette page est la seule construite pour l'instant ;
 * les autres seront ajoutées maquette par maquette, dans les mêmes
 * espaces de noms pour rester cohérent avec le cahier des charges.
 */
const routes = [
  {
    path: '/',
    redirect: '/connexion',
  },
  {
    path: '/connexion',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/eleve/dashboard',
    name: 'eleve-dashboard',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/DashboardView.vue'),
  },
  {
    path: '/eleve/cours',
    name: 'eleve-cours',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/CoursesView.vue'),
  },
  {
    path: '/eleve/exercices',
    name: 'eleve-exercices',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/ExercisesView.vue'),
  },
  {
    path: '/eleve/tuteur-ia',
    name: 'eleve-tuteur-ia',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/TutorAIView.vue'),
  },
  {
    path: '/eleve/progression',
    name: 'eleve-progression',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/ProgressionView.vue'),
  },
  {
    path: '/eleve/groupes',
    name: 'eleve-groupes',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/GroupsView.vue'),
  },
  {
    path: '/eleve/tickets',
    name: 'eleve-tickets',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/TicketsView.vue'),
  },
  {
    path: '/eleve/banque-epreuves',
    name: 'eleve-banque-epreuves',
    meta: { role: 'eleve' },
    component: () => import('@/views/eleve/ExamBankView.vue'),
  },
  {
    path: '/professeur/dashboard',
    name: 'prof-dashboard',
    meta: { role: 'professeur' },
    component: () => import('@/views/professeur/ProfDashboardView.vue'),
  },
  {
    path: '/professeur/tickets',
    name: 'prof-tickets',
    meta: { role: 'professeur' },
    component: () => import('@/views/professeur/ProfTicketsView.vue'),
  },
  {
    path: '/professeur/comprehension',
    name: 'prof-comprehension',
    meta: { role: 'professeur' },
    component: () => import('@/views/professeur/ProfComprehensionView.vue'),
  },
  {
    path: '/professeur/devoirs',
    name: 'prof-devoirs',
    meta: { role: 'professeur' },
    component: () => import('@/views/professeur/ProfAssignmentsView.vue'),
  },
  {
    path: '/professeur/programme',
    name: 'prof-programme',
    meta: { role: 'professeur' },
    component: () => import('@/views/professeur/ProfProgramView.vue'),
  },
  {
    path: '/professeur/contenus',
    name: 'prof-contenus',
    meta: { role: 'professeur' },
    component: () => import('@/views/professeur/ProfContentsView.vue'),
  },
  {
    path: '/parent/dashboard',
    name: 'parent-dashboard',
    meta: { role: 'parent' },
    component: () => import('@/views/parent/ParentDashboardView.vue'),
  },
  {
    path: '/parent/evolution',
    name: 'parent-evolution',
    meta: { role: 'parent' },
    component: () => import('@/views/parent/EvolutionView.vue'),
  },
  {
    path: '/parent/devoirs',
    name: 'parent-devoirs',
    meta: { role: 'parent' },
    component: () => import('@/views/parent/AssignmentsView.vue'),
  },
  {
    path: '/parent/messagerie',
    name: 'parent-messagerie',
    meta: { role: 'parent' },
    component: () => import('@/views/parent/MessagingView.vue'),
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    meta: { role: 'admin' },
    component: () => import('@/views/admin/AdminDashboardView.vue'),
  },
  {
    path: '/admin/eleves-enseignants',
    name: 'admin-eleves-enseignants',
    meta: { role: 'admin' },
    component: () => import('@/views/admin/PeopleView.vue'),
  },
  {
    path: '/admin/emploi-du-temps',
    name: 'admin-emploi-du-temps',
    meta: { role: 'admin' },
    component: () => import('@/views/admin/ScheduleView.vue'),
  },
  {
    path: '/admin/statistiques',
    name: 'admin-statistiques',
    meta: { role: 'admin' },
    component: () => import('@/views/admin/StatisticsView.vue'),
  },
  {
    path: '/admin/supervision',
    name: 'admin-supervision',
    meta: { role: 'admin' },
    component: () => import('@/views/admin/SupervisionView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router