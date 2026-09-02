import { mockNotionsDifficiles } from '@/mock/ministereNotionsDifficiles'

/**
 * notionsDifficilesService
 * À remplacer par une agrégation Firestore (calculée côté backend, à
 * partir des résultats de tous les établissements) quand le backend
 * sera disponible.
 */
export async function getNotionsDifficiles() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockNotionsDifficiles
}