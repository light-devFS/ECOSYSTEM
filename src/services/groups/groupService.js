import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

/**
 * Récupère tous les groupes (publics ou filtrés par userId)
 */
export async function getGroups() {
  const user = auth.currentUser
  if (!user) return [] // Si non connecté, on retourne un tableau vide

  // On récupère tous les groupes (pas de filtre pour l'instant, mais on peut ajouter un champ "public")
  const snapshot = await getDocs(collection(db, 'groups'))
  const groups = []
  snapshot.forEach((doc) => {
    groups.push({ id: doc.id, ...doc.data() })
  })
  return groups
}

/**
 * Récupère une suggestion IA depuis la collection aiSuggestions
 */
export async function getAiSuggestion() {
  const user = auth.currentUser
  if (!user) return null

  // Récupère la première suggestion non utilisée pour cet utilisateur
  const q = query(
    collection(db, 'aiSuggestions'),
    where('userId', '==', user.uid)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  // Prend la première suggestion
  let suggestion = null
  snapshot.forEach((doc) => {
    if (!suggestion) {
      suggestion = { id: doc.id, ...doc.data() }
    }
  })
  return suggestion
}

/**
 * Crée un nouveau groupe (pour la fonction "Créer un groupe")
 */
export async function createGroup(data) {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')

  const newGroup = {
    ...data,
    userId: user.uid,
    membres: data.membres || 1,
    createdAt: new Date(),
  }
  const docRef = await addDoc(collection(db, 'groups'), newGroup)
  return { id: docRef.id, ...newGroup }
}