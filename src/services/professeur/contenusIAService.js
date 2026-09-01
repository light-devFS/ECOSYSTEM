import { mockContenusIA } from '@/mock/contenusIA'

/**
 * contenusIAService
 * À remplacer par une lecture/écriture Firestore quand le backend
 * sera disponible (validation persistée côté serveur).
 */
export async function getContenusIA() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockContenusIA
}