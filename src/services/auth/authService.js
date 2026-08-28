/**
 * authService
 *
 * Toute la logique d'authentification passe par ce fichier.
 * Aucun composant Vue ne doit appeler Firebase directement : le jour
 * où le backend sera branché, seule l'implémentation ci-dessous change
 * (login/logout/getCurrentUser), l'interface reste identique.
 *
 * Connexion identifiant/e-mail/mot de passe : simulation avec les
 * utilisateurs mockés, en attendant Firebase Authentication côté backend.
 *
 * Connexion Google : réelle, via Firebase Auth (le fichier firebase.js
 * fourni par le backend est déjà utilisable pour ça).
 */
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { mockUsers } from '@/mock/users'
import { setCurrentUser, clearCurrentUser } from '@/services/auth/session'
import { app } from '@/services/firebase'

const SIMULATED_DELAY_MS = 600
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

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
  try {
    const provider = new GoogleAuthProvider()
    // Optionnel : ajouter des scopes si besoin
    // provider.addScope('https://www.googleapis.com/auth/userinfo.profile')
    const userCredential = await signInWithPopup(auth, provider)
    const { uid, displayName, email: userEmail, photoURL } = userCredential.user

    const user = {
      id: uid,
      name: displayName || 'Utilisateur',
      email: userEmail,
      photoURL: photoURL || '',
      role: 'eleve', // sera mis à jour via Firestore plus tard
    }
    setCurrentUser(user)
    return user
  } catch (error) {
    let message = 'Erreur lors de la connexion avec Google.'
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'La fenêtre de connexion a été fermée avant la fin du processus.'
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      message = 'Un compte existe déjà avec le même email mais un autre fournisseur.'
    }
    throw new Error(message)
  }
}

/**
 * Déconnexion
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth)
  } finally {
    clearCurrentUser()
  }
}

/**
 * Récupère l'utilisateur actuellement connecté (synchrone)
 * @returns {Object|null} L'utilisateur ou null
 */
export function getCurrentUser() {
  return auth.currentUser
}

/**
 * Initialise l'écoute de l'état d'authentification (persistance de session)
 * À appeler une fois au démarrage de l'application (dans main.js)
 * @returns {Function} Fonction de désinscription (si besoin)
 */
export function initAuthListener() {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const userData = {
        id: user.uid,
        name: user.displayName || 'Utilisateur',
        email: user.email,
        photoURL: user.photoURL || '',
        role: 'eleve', // à améliorer plus tard avec un doc Firestore
      }
      setCurrentUser(userData)
    } else {
      clearCurrentUser()
    }
  })
}

/**
 * Envoie un email de réinitialisation du mot de passe
 * @param {string} email - Adresse email du compte
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    let message = 'Impossible d\'envoyer l\'email de réinitialisation.'
    if (error.code === 'auth/user-not-found') {
      message = 'Aucun compte associé à cet email.'
    }
    throw new Error(message)
  }
}

/**
 * Met à jour le profil de l'utilisateur (nom, photo)
 * @param {Object} data - { displayName, photoURL }
 * @returns {Promise<void>}
 */
export async function updateUserProfile(data) {
  const user = auth.currentUser
  if (!user) throw new Error('Aucun utilisateur connecté')
  try {
    await updateProfile(user, data)
    const currentSession = getCurrentUser()
    if (currentSession) {
      setCurrentUser({
        ...currentSession,
        name: data.displayName || currentSession.name,
        photoURL: data.photoURL || currentSession.photoURL,
      })
    }
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du profil.')
  }
}

/**
 * Change l'email de l'utilisateur (nécessite une réauthentification)
 * @param {string} newEmail - Nouvel email
 * @param {string} password - Mot de passe actuel pour réauthentifier
 * @returns {Promise<void>}
 */
export async function changeEmail(newEmail, password) {
  const user = auth.currentUser
  if (!user) throw new Error('Aucun utilisateur connecté')
  try {
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
    await updateEmail(user, newEmail)
    const currentSession = getCurrentUser()
    if (currentSession) {
      setCurrentUser({
        ...currentSession,
        email: newEmail,
      })
    }
  } catch (error) {
    let message = 'Erreur lors du changement d\'email.'
    if (error.code === 'auth/wrong-password') {
      message = 'Mot de passe incorrect.'
    } else if (error.code === 'auth/email-already-in-use') {
      message = 'Cet email est déjà utilisé.'
    }
    throw new Error(message)
  }
}

/**
 * Change le mot de passe (nécessite une réauthentification)
 * @param {string} oldPassword - Ancien mot de passe
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<void>}
 */
export async function changePassword(oldPassword, newPassword) {
  const user = auth.currentUser
  if (!user) throw new Error('Aucun utilisateur connecté')
  try {
    const credential = EmailAuthProvider.credential(user.email, oldPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)
  } catch (error) {
    let message = 'Erreur lors du changement de mot de passe.'
    if (error.code === 'auth/wrong-password') {
      message = 'Ancien mot de passe incorrect.'
    } else if (error.code === 'auth/weak-password') {
      message = 'Le nouveau mot de passe est trop faible.'
    }
    throw new Error(message)
  }
}