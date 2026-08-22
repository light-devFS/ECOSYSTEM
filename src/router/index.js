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
  // Prochaines routes, à titre indicatif — ajoutées au fil des maquettes :
  // { path: '/parent/dashboard', name: 'parent-dashboard', meta: { role: 'parent' }, component: ... },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router