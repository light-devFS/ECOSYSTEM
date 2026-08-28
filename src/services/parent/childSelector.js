import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

/**
 * Renvoie l'uid du premier enfant relié au compte parent connecté
 * (champ `enfants` du profil parent).
 */
export async function getChildUid() {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')
  const userDoc = await getDoc(doc(db, 'users', user.uid))
  const enfants = userDoc.exists() ? userDoc.data().enfants : []
  if (!enfants || !enfants.length) {
    throw new Error('Aucun enfant relié à ce compte parent.')
  }
  return enfants[0]
}