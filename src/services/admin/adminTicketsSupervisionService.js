import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * adminTicketsSupervisionService
 * Tickets lus dans Firestore (collection "tickets"), enrichis avec le
 * nom et la classe de l'élève. Le suivi administratif vient du champ
 * "suivi" (nouveau / intervention / sans-reponse / cloture).
 */

export async function getTicketsSupervision(filters = {}) {
  const snapshot = await getDocs(collection(db, 'tickets'))
  const tickets = []

  for (const ticketDoc of snapshot.docs) {
    const data = ticketDoc.data()

    let eleve = data.eleve
    let classe = data.classe
    if (data.userId) {
      try {
        const userSnap = await getDoc(doc(db, 'users', data.userId))
        if (userSnap.exists()) {
          const userData = userSnap.data()
          eleve = eleve || userData.displayName
          classe = classe || userData.classe
        }
      } catch {
        // on garde les valeurs dénormalisées
      }
    }

    tickets.push({
      id: ticketDoc.id,
      eleve: eleve || 'Inconnu',
      notion: data.notion || '—',
      classe: classe || '—',
      statut: data.suivi || 'nouveau',
      priorite: data.priorite || 'normale',
    })
  }

  return tickets.filter((ticket) => {
    const statutOk = !filters.statut || filters.statut === 'tous' || ticket.statut === filters.statut
    const classeOk = !filters.classe || filters.classe === 'toutes' || ticket.classe === filters.classe
    const prioriteOk =
      !filters.priorite || filters.priorite === 'toutes' || ticket.priorite === filters.priorite
    const searchOk =
      !filters.recherche || ticket.eleve.toLowerCase().includes(filters.recherche.toLowerCase())
    return statutOk && classeOk && prioriteOk && searchOk
  })
}