import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

/**
 * Récupère la progression de l'utilisateur connecté
 * Lit la collection "progressions" et filtre par userId
 */
export async function getProgression() {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')

  const uid = user.uid

  // Récupérer tous les documents de progression pour cet utilisateur
  const q = query(collection(db, 'progressions'), where('userId', '==', uid))
  const snapshot = await getDocs(q)

  // Structure attendue par la vue
  const parMatiere = {}
  let erreursFrequentes = []
  let revisionsProgrammees = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    const matiere = data.matiere

    // Si la matière existe déjà, on fusionne (au cas où il y aurait plusieurs documents par matière)
    if (!parMatiere[matiere]) {
      parMatiere[matiere] = []
    }

    // Ajouter les compétences
    if (data.competences && Array.isArray(data.competences)) {
      parMatiere[matiere] = parMatiere[matiere].concat(data.competences)
    }

    // Récupérer les erreurs fréquentes (on prend celles du premier document)
    if (data.erreursFrequentes && Array.isArray(data.erreursFrequentes) && erreursFrequentes.length === 0) {
      erreursFrequentes = data.erreursFrequentes
    }

    // Récupérer les révisions programmées
    if (data.revisionsProgrammees && Array.isArray(data.revisionsProgrammees) && revisionsProgrammees.length === 0) {
      revisionsProgrammees = data.revisionsProgrammees
    }
  })

  return {
    parMatiere,
    erreursFrequentes,
    revisionsProgrammees,
  }
}