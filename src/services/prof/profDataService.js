import { collection, getDocs, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/services/firebase'

/**
 * profDataService
 * Données de l'espace professeur calculées sur Firestore :
 *  - tickets pédagogiques rattachés au professeur (matière ou nom)
 *  - compréhension de la classe (agrégats des "progressions")
 *  - indicateurs du tableau de bord
 *  - actions via callables : updateTicketStatut, createTicketGroupe
 */

const SEUIL_DIFFICULTE = 60

export function ticketOnglet(ticket) {
  if (ticket.suivi === 'nouveau' || ticket.suivi === 'sans-reponse') return 'nouveaux'
  if (ticket.suivi === 'intervention') return 'encours'
  return 'resolus'
}

export function ticketBadge(ticket) {
  const map = {
    nouveau: { label: 'Nouveau', variant: 'danger' },
    'sans-reponse': { label: 'Nouveau', variant: 'danger' },
    intervention: { label: 'En cours', variant: 'info' },
    cloture: { label: 'Résolu', variant: 'success' },
  }
  return map[ticket.suivi] || { label: ticket.suivi, variant: 'neutral' }
}

export async function getTicketsProf(user) {
  const snapshot = await getDocs(collection(db, 'tickets'))
  const tickets = []
  snapshot.forEach((docu) => {
    const t = docu.data()
    const memeMatiere = user.matiere && t.matiere && t.matiere === user.matiere
    const nomAssign = user.name && t.professeur && t.professeur.includes(user.name)
    if (!memeMatiere && !nomAssign) return
    tickets.push({ id: docu.id, ...t })
  })
  return tickets
}

export async function updateTicketStatut(ticketId, { suivi, note }) {
  const updateTicketSuivi = httpsCallable(functions, 'updateTicketStatut')
  const result = await updateTicketSuivi({ ticketId, suivi, note })
  return result.data
}

export async function createGroupeTicket({ notion, classe, matiere }) {
  const createGroup = httpsCallable(functions, 'createTicketGroupe')
  const result = await createGroup({ notion, classe, matiere })
  return result.data
}

/**
 * Agrège les progressions des élèves pour la matière du professeur :
 * par notion, part d'élèves « en difficulté » (compétence < 60 %)
 * et maîtrise moyenne.
 */
export async function getComprehensionClasses(user) {
  const elevesSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'eleve')))
  const eleves = new Map()
  elevesSnap.forEach((docu) => {
    const data = docu.data()
    eleves.set(docu.id, { nom: data.displayName || 'Élève', classe: data.classe || '—' })
  })

  const progSnap = await getDocs(collection(db, 'progressions'))
  const totalParNotion = {}
  const difficulteParNotion = {}
  const sommeParNotion = {}
  const classesParNotion = {}

  progSnap.forEach((docu) => {
    const data = docu.data()
    if (user.matiere && data.matiere !== user.matiere) return
    const eleve = eleves.get(docu.id) || eleves.get(data.userId) || { nom: 'Élève', classe: data.classe || '—' }

    if (!Array.isArray(data.competences)) return
    data.competences.forEach((c) => {
      const notion = c.competence
      const percent = Number(c.percent) || 0
      if (!totalParNotion[notion]) {
        totalParNotion[notion] = 0
        difficulteParNotion[notion] = 0
        sommeParNotion[notion] = 0
        classesParNotion[notion] = new Set()
      }
      totalParNotion[notion] += 1
      sommeParNotion[notion] += percent
      classesParNotion[notion].add(eleve.classe)
      if (percent < SEUIL_DIFFICULTE) difficulteParNotion[notion] += 1
    })
  })

  const notions = Object.entries(totalParNotion)
    .map(([notion, total]) => {
      const moyenne = Math.round(sommeParNotion[notion] / total)
      const enDifficulte = difficulteParNotion[notion]
      const percentEnDifficulte = Math.round((enDifficulte / total) * 100)
      const classe = [...classesParNotion[notion]].join(', ') || '—'
      const priorite = percentEnDifficulte >= 30 ? 'danger' : percentEnDifficulte >= 15 ? 'warning' : 'info'
      return {
        competence: notion,
        classe,
        enDifficulte,
        total,
        percentEnDifficulte,
        moyenne,
        priorite,
      }
    })
    .sort((a, b) => b.percentEnDifficulte - a.percentEnDifficulte)

  const comprehensionMoyenne = notions.length
    ? Math.round(notions.reduce((acc, n) => acc + n.moyenne, 0) / notions.length)
    : 0

  return { notions, comprehensionMoyenne }
}

/**
 * Maîtrise moyenne par classe, pour la matière du professeur.
 */
export async function getMaitriseParClasse(user) {
  const elevesSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'eleve')))
  const classeParUid = new Map()
  elevesSnap.forEach((docu) => {
    const data = docu.data()
    if (data.classe) classeParUid.set(docu.id, data.classe)
  })

  const progSnap = await getDocs(collection(db, 'progressions'))
  const sommeParClasse = {}
  const countParClasse = {}
  const elevesParClasse = new Set()

  progSnap.forEach((docu) => {
    const data = docu.data()
    if (user.matiere && data.matiere !== user.matiere) return
    const classe = classeParUid.get(docu.id) || data.classe || '—'
    elevesParClasse.add(`${classe}|${docu.id}`)
    if (!Array.isArray(data.competences)) return
    if (!sommeParClasse[classe]) {
      sommeParClasse[classe] = 0
      countParClasse[classe] = 0
    }
    data.competences.forEach((c) => {
      sommeParClasse[classe] += Number(c.percent) || 0
      countParClasse[classe] += 1
    })
  })

  return Object.entries(countParClasse).map(([classe, count]) => ({
    classe,
    moyenne: Math.round(sommeParClasse[classe] / count),
    eleves: [...elevesParClasse].filter((key) => key.startsWith(`${classe}|`)).length,
  }))
}

/**
 * Indicateurs du tableau de bord professeur.
 */
export async function getProfDashboard(user) {
  const [notionsData, tickets, assignmentsSnap] = await Promise.all([
    getComprehensionClasses(user),
    getTicketsProf(user),
    user.uid ? getDocs(query(collection(db, 'assignments'), where('profUid', '==', user.uid))) : Promise.resolve({ docs: [] }),
  ])

  const classesActives = (user.classes && user.classes.length) || 1
  const ticketsEnAttente = tickets.filter((t) => t.suivi !== 'cloture' && t.suivi !== 'resolu')
  const urgents = ticketsEnAttente.filter((t) => t.priorite === 'urgent').length

  const copiesDevoirs = assignmentsSnap.docs.length
  const devoirsGroupes = new Set(assignmentsSnap.docs.map((d) => `${d.data().title}|${d.data().classe}`))

  const alertes = notionsData.notions
    .filter((n) => n.percentEnDifficulte >= 15)
    .slice(0, 3)
    .map((n) => ({
      competence: n.competence,
      libelle: `${n.classe} · ${n.percentEnDifficulte}% des élèves en difficulté`,
      badge: n.priorite === 'danger' ? { label: 'Prioritaire', variant: 'danger' } : n.priorite === 'warning' ? { label: 'À surveiller', variant: 'warning' } : { label: 'Stable', variant: 'success' },
    }))

  return {
    classesActives,
    comprehensionMoyenne: notionsData.comprehensionMoyenne,
    devoirsACorriger: devoirsGroupes.size,
    devoirsCaption: `Sur ${classesActives} classe(s)`,
    ticketsEnAttente: ticketsEnAttente.length,
    urgents,
    alertes,
  }
}