import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { setCurrentUser, clearCurrentUser } from '@/services/auth/session'

/**
 * Connexion avec Firebase Auth
 */
export async function login(credentials) {
  const { email, password } = credentials
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const { uid, displayName, email: userEmail } = userCredential.user

    const user = {
      id: uid,
      name: displayName || 'Utilisateur',
      email: userEmail,
      role: 'eleve', // sera amélioré plus tard avec un doc Firestore
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
      default:
        message = error.message
    }
    throw new Error(message)
  }
}

export async function logout() {
  await signOut(auth)
  clearCurrentUser()
}

export function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userData = {
        id: user.uid,
        name: user.displayName || 'Utilisateur',
        email: user.email,
        role: 'eleve',
      }
      setCurrentUser(userData)
    } else {
      clearCurrentUser()
    }
  })
}