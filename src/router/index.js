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
  // Prochaines routes, à titre indicatif — ajoutées au fil des maquettes :
  // { path: '/parent/dashboard', name: 'parent-dashboard', meta: { role: 'parent' }, component: ... },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router