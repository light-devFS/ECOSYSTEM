import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { getChildUid } from '@/services/parent/childSelector'

/**
 * parentDashboardService
 * Tableau de bord du parent calculé sur les vraies données Firestore de
 * (ses) enfant(s) lié(s) au compte parent (`enfants: [uid]`).
 */

const SEUIL_DIFFICULTE = 60

export async function getParentDashboard() {
  const childUid = await getChildUid()

  const [childSnap, progressionsSnap, ticketsSnap, assignmentsSnap] =
    await Promise.all([
      getDoc(doc(db, 'users', childUid)),
      getDocs(query(collection(db, 'progressions'), where('userId', '==', childUid))),
      getDocs(query(collection(db, 'tickets'), where('userId', '==', childUid))),
      getDocs(query(collection(db, 'assignments'), where('userId', '==', childUid))),
    ])

  const child = childSnap.exists() ? childSnap.data() : {}
  const nom = child.displayName || 'Votre enfant'
  const classe = child.classe || '—'
  const niveau = classe || '—'

  // --- Scores par matière (agrégats des compétences)
  const parMatiere = {}
  const entrees = []
  progressionsSnap.forEach((d) => {
    const data = d.data()
    if (!Array.isArray(data.competences)) return
    if (!parMatiere[data.matiere]) parMatiere[data.matiere] = []
    data.competences.forEach((c) => {
      const percent = Number(c.percent) || 0
      parMatiere[data.matiere].push(percent)
      entrees.push({ matiere: data.matiere, competence: c.competence, percent })
    })
  })
  const totalGlobal = Object.values(parMatiere).map((percents) =>
    Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
  )
  const notionsFaibles = entrees.filter((e) => e.percent < SEUIL_DIFFICULTE)
  const moyenneGlobale = totalGlobal.length
    ? Math.round(totalGlobal.reduce((a, b) => a + b, 0) / totalGlobal.length)
    : 0
  const niveauGlobal = moyenneGlobale >= 75 ? 'Très bon' : moyenneGlobale >= 50 ? 'Bon' : 'À suivre'

  // --- Devoirs
  const maintenant = Date.now()
  const devoirsRetard = assignmentsSnap.docs.filter((d) => {
    const data = d.data()
    const due = data.dueDate && data.dueDate.toDate ? data.dueDate.toDate().getTime() : Infinity
    return due < maintenant && data.status === 'à faire'
  }).length

  // --- Tickets + alertes
  const ticketsSuivis = ticketsSnap.size
  const alertesImportantes = [
    ...(notionsFaibles.length
      ? [{
            id: 'al1',
            titre: 'Difficulté persistante détectée',
            description: `${notionsFaibles[0].competence} · ${notionsFaibles[0].matiere}`,
            action: 'Ticket ouvert',
          }]
      : []),
    ...(devoirsRetard > 0
      ? [{
            id: 'al2',
            titre: 'Devoir en retard',
            description: `${devoirsRetard} devoir(s) dont l’échéance est dépassée`,
            action: 'À suivre',
          }]
      : []),
  ]

  return {
    enfants: [{ id: childUid, nom, niveau }],
    suivi: {
      nom,
      niveau: classe,
      etablissement: 'Lycée Moderne de Lomé',
    },
    stats: {
      niveauGlobal,
      devoirsEnRetard: devoirsRetard,
      alertes: alertesImportantes.length,
      ticketsSuivis,
    },
    alertesImportantes,
  }
}