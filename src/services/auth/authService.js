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
 * Charge le profil Firestore d'un utilisateur (rôle, nom, identifiant).
 * @param {string} uid
 * @returns {Promise<{ id: string, name: string, email: string, role: string, identifier: string|null }|null>}
 */
async function loadProfile(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (!userDoc.exists()) return null
  const data = userDoc.data()
  return {
    id: uid,
    name: data.displayName || data.email || 'Utilisateur',
    email: data.email,
    role: data.role || 'eleve',
    identifier: data.identifier || null,
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
  } catch (error) {
    throw new Error('La connexion avec Google a échoué. Merci de réessayer.')
  }

  const user = (await loadProfile(firebaseUser.uid)) || {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Utilisateur Google',
    email: firebaseUser.email,
    role: 'eleve',
    identifier: null,
  }

  setCurrentUser(user)
  return user
}

export async function logout() {
  await signOut(auth)
  clearCurrentUser()
}