import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

/**
 * Récupère tous les tickets de l'utilisateur connecté
 */
export async function getTickets() {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')

  const q = query(collection(db, 'tickets'), where('userId', '==', user.uid))
  const snapshot = await getDocs(q)

  const tickets = []
  snapshot.forEach((doc) => {
    tickets.push({ id: doc.id, ...doc.data() })
  })
  return tickets
}

/**
 * Crée un nouveau ticket
 */
export async function createTicket(data) {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')

  const newTicket = {
    ...data,
    userId: user.uid,
    statut: data.statut || 'en-cours',
    createdAt: new Date(),
  }
  const docRef = await addDoc(collection(db, 'tickets'), newTicket)
  return { id: docRef.id, ...newTicket }
}

/**
 * Met à jour le statut d'un ticket (ex: "resolu")
 */
export async function updateTicketStatus(ticketId, newStatus) {
  const docRef = doc(db, 'tickets', ticketId)
  await updateDoc(docRef, { statut: newStatus })
}