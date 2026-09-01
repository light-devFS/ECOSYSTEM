import { mockProfTickets } from '@/mock/profTickets'

/**
 * profTicketsService
 * À remplacer par une lecture/écriture Firestore quand le backend
 * sera disponible.
 */
export async function getProfTickets() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockProfTickets
}

export async function saveIntervention(payload) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { id: `int-${Date.now()}`, ...payload }
}