import { mockProgression } from '@/mock/progression'

/**
 * progressionService
 * À remplacer par une lecture Firestore (progression par compétence,
 * planning de répétition espacée) quand le backend sera disponible.
 */
export async function getProgression() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockProgression
}