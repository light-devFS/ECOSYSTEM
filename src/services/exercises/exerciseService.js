import { mockExercises } from '@/mock/exercises'

/**
 * exerciseService
 * À remplacer par une lecture Firestore quand le backend sera disponible.
 */
export async function getStudentExercises() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockExercises
}