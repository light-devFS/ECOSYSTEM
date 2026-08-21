/**
 * authService
 *
 * Toute la logique d'authentification passe par ce fichier.
 * Aucun composant Vue ne doit appeler Firebase directement : le jour
 * où le backend sera branché, seule l'implémentation ci-dessous change
 * (login/logout/getCurrentUser), l'interface reste identique.
 *
 * Implémentation actuelle : simulation avec les utilisateurs mockés,
 * en attendant Firebase Authentication.
 */
import { mockUsers } from '@/mock/users'
import { setCurrentUser, clearCurrentUser } from '@/services/auth/session'

const SIMULATED_DELAY_MS = 600

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Tente une connexion.
 * @param {{ identifier: string, email: string, password: string }} credentials
 * @returns {Promise<{ id: string, name: string, role: string }>}
 * @throws {Error} avec un message destiné à être affiché à l'utilisateur
 */
export async function login(credentials) {
  await delay(SIMULATED_DELAY_MS)

  const user = mockUsers.find(
    (candidate) =>
      candidate.identifier === credentials.identifier && candidate.email === credentials.email
  )

  if (!user || user.password !== credentials.password) {
    throw new Error('Identifiant, e-mail ou mot de passe incorrect.')
  }

  const { password, ...safeUser } = user
  setCurrentUser(safeUser)
  return safeUser
}

export async function logout() {
  await delay(200)
  clearCurrentUser()
}