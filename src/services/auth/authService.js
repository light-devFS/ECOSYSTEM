import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,      // ← Import pour Google
  signInWithPopup          // ← Import pour la popup
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { setCurrentUser, clearCurrentUser } from '@/services/auth/session'

/**
 * Connexion avec email et mot de passe
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Utilisateur connecté (sans données sensibles)
 */
export async function login(credentials) {
  const { email, password } = credentials
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const { uid, displayName, email: userEmail, photoURL } = userCredential.user

    const user = {
      id: uid,
      name: displayName || 'Utilisateur',
      email: userEmail,
      photoURL: photoURL || '',
      role: 'eleve',
    }
    setCurrentUser(user)
    return user
  } catch (error) {
    let message = 'Une erreur est survenue lors de la connexion.'
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Aucun utilisateur trouvé avec cet email.'
        break
      case 'auth/wrong-password':
        message = 'Mot de passe incorrect.'
        break
      case 'auth/invalid-email':
        message = 'Adresse email invalide.'
        break
      case 'auth/too-many-requests':
        message = 'Trop de tentatives. Réessaie plus tard.'
        break
      case 'auth/user-disabled':
        message = 'Ce compte a été désactivé.'
        break
      default:
        message = error.message
    }
    throw new Error(message)
  }
}

/**
 * Connexion avec Google (popup)
 * @returns {Promise<Object>} Utilisateur connecté
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