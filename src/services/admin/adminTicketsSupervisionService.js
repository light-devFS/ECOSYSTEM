import { mockTicketsSupervision } from '@/mock/adminTicketsSupervision'

/**
 * adminTicketsSupervisionService
 * Le filtrage est fait ici pour rester compatible avec un futur
 * filtrage côté serveur, une fois Firestore branché.
 */
export async function getTicketsSupervision(filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return mockTicketsSupervision.filter((ticket) => {
    const statutOk = !filters.statut || filters.statut === 'tous' || ticket.statut === filters.statut
    const classeOk = !filters.classe || filters.classe === 'toutes' || ticket.classe === filters.classe
    const prioriteOk =
      !filters.priorite || filters.priorite === 'toutes' || ticket.priorite === filters.priorite
    const searchOk =
      !filters.recherche || ticket.eleve.toLowerCase().includes(filters.recherche.toLowerCase())
    return statutOk && classeOk && prioriteOk && searchOk
  })
}