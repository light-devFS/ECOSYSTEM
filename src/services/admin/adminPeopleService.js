import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/services/firebase'

/**
 * adminPeopleService
 * Élèves et enseignants lus dans Firestore (collection "users"),
 * avec la classe / la matière assignées par l'école.
 */

function moyenneSur20(overall = 0) {
  const moyenne = Math.round((overall / 100) * 20 * 10) / 10
  return `${moyenne} / 20`
}

export async function getEleves() {
  const q = query(collection(db, 'users'), where('role', '==', 'eleve'))
  const snapshot = await getDocs(q)
  const eleves = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    eleves.push({
      id: doc.id,
      nom: data.displayName || data.email,
      email: data.email || '',
      classe: data.classe || '—',
      moyenne: moyenneSur20(data.progress?.overall),
      statut: data.statut || 'actif',
    })
  })
  return eleves
}

export async function getEnseignants() {
  const q = query(collection(db, 'users'), where('role', '==', 'professeur'))
  const snapshot = await getDocs(q)
  const enseignants = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    enseignants.push({
      id: doc.id,
      nom: data.displayName || data.email,
      matiere: data.matiere || '—',
      classes: Array.isArray(data.classes) ? data.classes.length : 0,
      statut: data.statut || 'actif',
    })
  })
  return enseignants
}

export async function getClasses() {
  const snapshot = await getDocs(collection(db, 'classes'))
  const classes = []
  snapshot.forEach((doc) => {
    const name = doc.data().name
    if (name) classes.push(name)
  })
  return classes
}

/**
 * Crée un compte élève via la fonction backend (rôle élève + classe).
 * @returns {Promise<void>}
 */
export async function createEleve({ nom, email, classe }) {
  const createUserAccount = httpsCallable(functions, 'createUserAccount')
  const result = await createUserAccount({
    displayName: nom,
    email,
    role: 'eleve',
    classe,
  })
  return result.data
}

export async function updateEleve(id, { nom, email, classe, statut }) {
  await updateDoc(doc(db, 'users', id), { displayName: nom, email, classe, statut })
}