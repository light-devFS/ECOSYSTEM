import { mockProfDevoirs } from '@/mock/profDevoirs'

/**
 * profDevoirsService
 * À remplacer par une lecture/écriture Firestore quand le backend
 * sera disponible.
 */
export async function getProfDevoirs() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockProfDevoirs
}