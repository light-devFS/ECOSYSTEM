import { mockCourses } from '@/mock/courses'

/**
 * courseService
 * À remplacer par une lecture Firestore (collection "courses" filtrée
 * par élève/classe) quand le backend sera disponible.
 */
export async function getStudentCourses() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockCourses
}