import { mockTickets } from '@/mock/tickets'

/**
 * ticketService
 * À remplacer par des lectures/écritures Firestore quand le backend
 * sera disponible (collection "tickets", historique des étapes).
 */
export async function getTickets() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockTickets
}