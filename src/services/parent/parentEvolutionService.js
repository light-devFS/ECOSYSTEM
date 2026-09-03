import { mockEvolution } from '@/mock/parentEvolution'

/**
 * parentEvolutionService
 * À remplacer par une lecture Firestore (progression de l'enfant lié
 * au compte parent) quand le backend sera disponible.
 */
export async function getEvolution() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockEvolution
}