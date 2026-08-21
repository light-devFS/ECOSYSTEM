import { reactive, readonly } from 'vue'

/**
 * Session utilisateur courant.
 * Simple état réactif partagé — suffisant tant qu'on n'a pas besoin
 * de Pinia. Alimenté par authService après une connexion réussie.
 */
const state = reactive({
  user: null,
})

export function setCurrentUser(user) {
  state.user = user
}

export function clearCurrentUser() {
  state.user = null
}

export function useSession() {
  return readonly(state)
}