import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { getChildUid } from '@/services/parent/childSelector'

/**
 * parentEvolutionService
 * Progression par matière de l'enfant (moyenne des compétences des
 * "progressions"), comparée visuellement à la page Evolution.
 */

const subjectColorMap = {
  'Mathématiques': 'primary',
  'Physique-Chimie': 'warning',
  'Physique-chimie': 'warning',
  SVT: 'teal',
  Anglais: 'success',
  Français: 'danger',
}

export async function getEvolution() {
  const childUid = await getChildUid()
  const snapshot = await getDocs(query(collection(db, 'progressions'), where('userId', '==', childUid)))

  const parMatiere = {}
  snapshot.forEach((docu) => {
    const data = docu.data()
    if (!Array.isArray(data.competences)) return
    if (!parMatiere[data.matiere]) parMatiere[data.matiere] = []
    data.competences.forEach((c) => parMatiere[data.matiere].push(Number(c.percent) || 0))
  })

  return Object.entries(parMatiere).map(([matiere, percents]) => ({
    matiere,
    percent: Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
    color: subjectColorMap[matiere] || 'primary',
  }))
}