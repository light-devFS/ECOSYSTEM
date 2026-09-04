import { mockPrograms } from '@/mock/ministerePrograms'

/**
 * officialProgramsService
 * Le paramètre niveau est déjà prévu pour un filtrage côté serveur
 * une fois Firestore branché.
 */
export async function getOfficialPrograms(niveau) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockPrograms
}

export async function publishProgramVersion(matiereId, files) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return { matiereId, fichiers: files, publieLe: new Date().toISOString() }
}