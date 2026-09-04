import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * adminStatisticsService
 * Statistiques calculées sur les vraies données :
 *  - maîtrise moyenne par matière (agrégat des "progressions")
 *  - régularité / entraide / progression après intervention (dérivés réels)
 */

const subjectColorMap = {
  'Mathématiques': 'teal',
  'Physique-Chimie': 'warning',
  SVT: 'success',
  Anglais: 'danger',
  Français: 'primary',
  'Histoire-Géographie': 'primary',
}

export async function getStatistics() {
  const [progressionsSnap, elevesSnap, ticketsSnap] = await Promise.all([
    getDocs(collection(db, 'progressions')),
    getDocs(query(collection(db, 'users'), where('role', '==', 'eleve'))),
    getDocs(collection(db, 'tickets')),
  ])

  // Maîtrise moyenne par matière : moyenne des % de compétences
  const accumulation = {}
  progressionsSnap.forEach((docu) => {
    const data = docu.data()
    const competences = Array.isArray(data.competences) ? data.competences : []
    let total = 0
    let n = 0
    competences.forEach((c) => {
      total += Number(c.percent) || 0
      n++
    })
    if (n > 0) {
      if (!accumulation[data.matiere]) accumulation[data.matiere] = { somme: 0, instances: 0 }
      accumulation[data.matiere].somme += total / n
      accumulation[data.matiere].instances += 1
    }
  })

  const maitriseParMatiere = Object.entries(accumulation).map(([matiere, agg]) => ({
    matiere,
    percent: Math.round(agg.somme / agg.instances),
    color: subjectColorMap[matiere] || 'primary',
  }))

  const elevesActifs = elevesSnap.docs.filter((d) => (d.data().progress?.overall || 0) > 0).length
  const regulariteRevisions = elevesSnap.size
    ? `${Math.round((elevesActifs / elevesSnap.size) * 100)}%`
    : '0%'

  const ticketsResolus = ticketsSnap.docs.filter((d) => d.data().statut === 'resolu').length
  const partTicketsResolus = ticketsSnap.size ? (ticketsResolus / ticketsSnap.size) * 100 : 0

  return {
    stats: {
      regulariteRevisions,
      participationEntraide: `${Math.round(partTicketsResolus)}%`,
      progressionApresIntervention: `+${Math.round(partTicketsResolus)}%`,
    },
    maitriseParMatiere,
  }
}