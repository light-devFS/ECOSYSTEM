import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * Récupère les épreuves depuis Firestore avec filtrage
 */
export async function getExamBank(filters = {}) {
  // Construire la requête de base
  let q = collection(db, 'examBank')
  const conditions = []

  if (filters.pays && filters.pays !== 'Toutes') {
    conditions.push(where('pays', '==', filters.pays))
  }
  if (filters.niveau && filters.niveau !== 'Tous') {
    conditions.push(where('niveau', '==', filters.niveau))
  }
  if (filters.matiere && filters.matiere !== 'Toutes') {
    conditions.push(where('matiere', '==', filters.matiere))
  }
  if (filters.type && filters.type !== 'Tous') {
    conditions.push(where('type', '==', filters.type))
  }

  // Appliquer les conditions
  if (conditions.length > 0) {
    q = query(collection(db, 'examBank'), ...conditions)
  }

  const snapshot = await getDocs(q)
  const resultats = []
  snapshot.forEach((doc) => {
    resultats.push({ id: doc.id, ...doc.data() })
  })

  // Récupérer toutes les valeurs possibles pour les filtres (depuis Firestore)
  const allDocs = await getDocs(collection(db, 'examBank'))
  const paysSet = new Set()
  const niveauxSet = new Set()
  const matieresSet = new Set()
  const typesSet = new Set()

  allDocs.forEach((doc) => {
    const data = doc.data()
    if (data.pays) paysSet.add(data.pays)
    if (data.niveau) niveauxSet.add(data.niveau)
    if (data.matiere) matieresSet.add(data.matiere)
    if (data.type) typesSet.add(data.type)
  })

  return {
    filtres: {
      pays: Array.from(paysSet),
      niveaux: Array.from(niveauxSet),
      matieres: Array.from(matieresSet),
      typesEpreuve: Array.from(typesSet),
    },
    total: resultats.length,
    resultats,
  }
}