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
<<<<<<< Updated upstream
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { setCurrentUser, clearCurrentUser } from '@/services/auth/session'
import { app, db } from '@/services/firebase'

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

/**
 * Charge le profil Firestore d'un utilisateur (rôle, nom, identifiant,
 * matière et classes pour les professeurs).
 * @param {string} uid
 * @returns {Promise<{ id: string, uid: string, name: string, email: string, role: string, identifier: string|null, matiere: string|null, classe: string|null, classes: string[], enfants: string[] }|null>}
 */
async function loadProfile(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (!userDoc.exists()) return null
  const data = userDoc.data()
  return {
    id: uid,
    uid,
    name: data.displayName || data.email || 'Utilisateur',
    email: data.email,
    role: data.role || 'eleve',
    identifier: data.identifier || null,
    matiere: data.matiere || null,
    classe: data.classe || null,
    classes: data.classes || [],
    enfants: data.enfants || [],
  }
}

function friendlyMessage(error) {
  const code = error && error.code ? error.code : ''
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Adresse e-mail ou mot de passe incorrect.'
  }
  if (code.includes('too-many-requests')) {
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  }
  return 'La connexion a échoué. Merci de réessayer.'
}

/**
 * Tente une connexion (Firebase Auth réel + profil Firestore).
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ id: string, name: string, email: string, role: string, identifier: string|null }>}
 * @throws {Error} avec un message destiné à être affiché à l'utilisateur
 */
export async function login(credentials) {
  let firebaseUser
  try {
    const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
    firebaseUser = result.user
  } catch (error) {
    throw new Error(friendlyMessage(error))
  }

  const user = (await loadProfile(firebaseUser.uid)) || {
    id: firebaseUser.uid,
    name: firebaseUser.email,
    email: firebaseUser.email,
    role: 'eleve',
    identifier: null,
  }

  setCurrentUser(user)
  return user
}

/**
 * Connexion via Google (Firebase Auth réel), rôle lu dans Firestore.
 * @returns {Promise<{ id: string, name: string, email: string, role: string, identifier: string|null }>}
 * @throws {Error} avec un message destiné à être affiché à l'utilisateur
 */
export async function loginWithGoogle() {
  let firebaseUser
  try {
    const result = await signInWithPopup(auth, googleProvider)
    firebaseUser = result.user
=======
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
>>>>>>> Stashed changes
  } catch (error) {
    throw new Error('La connexion avec Google a échoué. Merci de réessayer.')
  }

<<<<<<< Updated upstream
  const user = (await loadProfile(firebaseUser.uid)) || {
=======
  const firebaseUser = result.user
  const user = {
>>>>>>> Stashed changes
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Utilisateur Google',
    email: firebaseUser.email,
    role: 'eleve',
<<<<<<< Updated upstream
    identifier: null,
  }

=======
  }
>>>>>>> Stashed changes
  setCurrentUser(user)
  return user
}

export async function logout() {
<<<<<<< Updated upstream
  await signOut(auth)
=======
  await delay(200)
>>>>>>> Stashed changes
  clearCurrentUser()
}