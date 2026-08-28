import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { getChildUid } from '@/services/parent/childSelector'

/**
 * parentAssignmentsService
 * Devoirs de l'enfant (collection "assignments" filtrée par enfant).
 */

function formatDueDate(value) {
  if (!value) return '—'
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(now, date)) return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  if (sameDay(tomorrow, date)) return `Demain, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  return date.toLocaleDateString('fr-FR')
}

function computeStatut(data) {
  const due = data.dueDate && data.dueDate.toDate ? data.dueDate.toDate().getTime() : Infinity
  if (data.status === 'à faire' && due < Date.now()) return 'en-retard'
  if (data.status !== 'à faire') return 'rendu'
  return 'a-faire'
}

export async function getAssignments() {
  const childUid = await getChildUid()
  const snapshot = await getDocs(query(collection(db, 'assignments'), where('userId', '==', childUid)))

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      matiere: data.subject || '—',
      titre: data.title || '—',
      echeance: formatDueDate(data.dueDate),
      statut: computeStatut(data),
    }
  })
}