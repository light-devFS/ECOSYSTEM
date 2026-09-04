import { mockChapterDetails } from '@/mock/chapterDetails'

/**
 * chapterDetailService
 * À remplacer par une lecture Firestore (chapitre + exercices générés
 * par l'IA + séances planifiées) quand le backend sera disponible.
 */
export async function getChapterDetail(chapitreId) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockChapterDetails[chapitreId] || null
}