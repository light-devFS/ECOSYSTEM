import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * examBankService
 * Banque d'épreuves lue dans Firestore (collection "exams").
 * Seules les épreuves publiées sont visibles ; les filtres de la vue
 * sont reconstruits à partir des vraies valeurs présentes.
 */

export async function getExamBank(filters = {}) {
  const q = query(collection(db, 'exams'), where('statut', '==', 'publie'))
  const snapshot = await getDocs(q)

  const epreuves = []
  snapshot.forEach((doc) => {
    epreuves.push({ id: doc.id, ...doc.data() })
  })

  const distinct = (values) => [...new Set(values.filter(Boolean))]
  const niveaux = distinct(epreuves.map((e) => e.niveau))
  const matieres = ['Toutes', ...distinct(epreuves.map((e) => e.matiere))]
  const typesEpreuve = distinct(epreuves.map((e) => e.type))
  const pays = distinct(epreuves.map((e) => e.pays))

  const resultats = epreuves.filter((item) => {
    const matiereOk = !filters.matiere || filters.matiere === 'Toutes' || item.matiere === filters.matiere
    const typeOk = !filters.type || item.type === filters.type
    const niveauOk = !filters.niveau || item.niveau === filters.niveau
    const paysOk = !filters.pays || item.pays === filters.pays
    return matiereOk && typeOk && niveauOk && paysOk
  })

  return {
    filtres: { pays, niveaux, matieres, typesEpreuve },
    total: resultats.length,
    resultats,
  }
}