/**
 * authService
 *
 * Toute la logique d'authentification passe par ce fichier.
 * Aucun composant Vue ne doit appeler Firebase directement : le jour
 * où le backend sera branché, seule l'implémentation ci-dessous change
 * (login/logout/getCurrentUser), l'interface reste identique.
 *
 * Connexion e-mail/mot de passe : simulation avec les utilisateurs
 * mockés, en attendant Firebase Authentication côté backend.
 *
 * Connexion Google : réelle, via Firebase Auth (le fichier firebase.js
 * fourni par le backend est déjà utilisable pour ça).
 */
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { mockUsers } from '@/mock/users'
import { setCurrentUser, clearCurrentUser } from '@/services/auth/session'
import { app } from '@/services/firebase'

const SIMULATED_DELAY_MS = 600

/**
 * L'initialisation de Firebase Auth est différée jusqu'au premier
 * clic sur "Se connecter avec Google". Si on l'initialisait dès le
 * chargement de ce fichier (comme avant), Firebase contacterait ses
 * serveurs dès l'arrivée sur la page de connexion — même pour une
 * simple connexion e-mail/mot de passe mockée, qui n'en a pas besoin.
 */
let auth
let googleProvider

function getGoogleAuth() {
  if (!auth) {
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  }
  return { auth, googleProvider }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Tente une connexion.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ id: string, name: string, role: string }>}
 * @throws {Error} avec un message destiné à être affiché à l'utilisateur
 */
export async function login(credentials) {
  await delay(SIMULATED_DELAY_MS)

  const user = mockUsers.find((candidate) => candidate.email === credentials.email)

  if (!user || user.password !== credentials.password) {
    throw new Error('Adresse e-mail ou mot de passe incorrect.')
  }

  const { password, ...safeUser } = user
  setCurrentUser(safeUser)
  return safeUser
}

/**
 * Connexion via Google (Firebase Auth réel).
 * Le rôle est fixé à "eleve" par défaut pour l'instant : il n'existe
 * pas encore de profil backend qui associe un compte Google à un rôle
 * (élève/parent/prof/admin). À remplacer par une lecture Firestore du
 * profil utilisateur dès que le backend l'expose.
 * @returns {Promise<{ id: string, name: string, email: string, role: string }>}
 * @throws {Error} avec un message destiné à être affiché à l'utilisateur
 */
export async function loginWithGoogle() {
  const { auth, googleProvider } = getGoogleAuth()

  let result
  try {
    result = await signInWithPopup(auth, googleProvider)
  } catch (error) {
    throw new Error('La connexion avec Google a échoué. Merci de réessayer.')
  }

  const firebaseUser = result.user
  const user = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Utilisateur Google',
    email: firebaseUser.email,
    role: 'eleve',
  }
  setCurrentUser(user)
  return user
}

export async function logout() {
  await delay(200)
  clearCurrentUser()
}