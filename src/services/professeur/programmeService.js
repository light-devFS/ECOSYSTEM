import { mockProgramme } from '@/mock/programme'

/**
 * programmeService
 * Les filtres (pays/niveau/matière) sont déjà prévus pour un filtrage
 * côté serveur une fois Firestore branché.
 */
export async function getProgramme(filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockProgramme
}