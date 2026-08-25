import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

/**
 * Récupère les exercices de l'utilisateur connecté
 */
export async function getStudentExercises() {
  const user = auth.currentUser
  if (!user) return []

  const q = query(collection(db, 'exercises'), where('userId', '==', user.uid))
  const snapshot = await getDocs(q)
  const exercises = []
  snapshot.forEach((doc) => {
    exercises.push({ id: doc.id, ...doc.data() })
  })
  return exercises
}