import { reactive, readonly } from 'vue'

/**
 * État d'affichage partagé entre AppSidebar et AppHeader.
 * Ces deux composants sont frères (pas parent/enfant) dans chaque vue,
 * donc un petit état réactif partagé évite de faire remonter/redescendre
 * l'état via props sur chaque page — comme session.js pour l'utilisateur.
 */
const state = reactive({
  sidebarOpen: false,
})

export function useLayoutState() {
  return readonly(state)
}

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen
}

export function closeSidebar() {
  state.sidebarOpen = false
}