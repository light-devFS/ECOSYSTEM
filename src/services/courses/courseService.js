import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * Récupère tous les cours (accessible à tout utilisateur authentifié)
 */
export async function getStudentCourses() {
  const querySnapshot = await getDocs(collection(db, 'courses'))
  const courses = []
  querySnapshot.forEach((doc) => {
    courses.push({ id: doc.id, ...doc.data() })
  })
  return courses
}