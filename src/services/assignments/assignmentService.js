import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, auth, functions } from '@/services/firebase'

/**
 * Récupère les devoirs créés par le professeur connecté (création de
 * devoir pour toute une classe via la fonction backend createAssignment).
 */
export async function getAssignmentsByCreator(userId = null) {
  const uid = userId || auth.currentUser?.uid
  if (!uid) throw new Error('Utilisateur non connecté')

  const q = query(collection(db, 'assignments'), where('profUid', '==', uid))
  const snapshot = await getDocs(q)
  const assignments = []
  snapshot.forEach((doc) => {
    assignments.push({ id: doc.id, ...doc.data() })
  })
  return assignments
}

/**
 * Crée un devoir pour toute une classe via la fonction backend
 * (chaque élève de la classe reçoit sa copie dans "assignments").
 * @returns {Promise<{count: number, classe: string}>}
 */
export async function createAssignmentForClass(data) {
  const createAssignment = httpsCallable(functions, 'createAssignment')
  const result = await createAssignment(data)
  return result.data
}

/**
 * Récupère tous les assignments d'un utilisateur
 */
export async function getAssignments(userId = null) {
  const uid = userId || auth.currentUser?.uid
  if (!uid) throw new Error('Utilisateur non connecté')

  const q = query(collection(db, 'assignments'), where('userId', '==', uid))
  const snapshot = await getDocs(q)
  const assignments = []
  snapshot.forEach((doc) => {
    assignments.push({ id: doc.id, ...doc.data() })
  })
  return assignments
}

/**
 * Récupère uniquement les devoirs à faire (status = 'à faire')
 */
export async function getPendingAssignments(userId = null) {
  const uid = userId || auth.currentUser?.uid
  if (!uid) throw new Error('Utilisateur non connecté')

  const q = query(
    collection(db, 'assignments'),
    where('userId', '==', uid),
    where('status', '==', 'à faire')
  )
  const snapshot = await getDocs(q)
  const assignments = []
  snapshot.forEach((doc) => {
    assignments.push({ id: doc.id, ...doc.data() })
  })
  return assignments
}

/**
 * Crée un nouvel assignment
 */
export async function createAssignment(data) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Utilisateur non connecté')

  const newData = {
    ...data,
    userId: uid,
    createdAt: new Date(),
  }
  const docRef = await addDoc(collection(db, 'assignments'), newData)
  return { id: docRef.id, ...newData }
}

/**
 * Met à jour un assignment
 */
export async function updateAssignment(assignmentId, data) {
  const docRef = doc(db, 'assignments', assignmentId)
  await updateDoc(docRef, data)
}

/**
 * Supprime un assignment
 */
export async function deleteAssignment(assignmentId) {
  const docRef = doc(db, 'assignments', assignmentId)
  await deleteDoc(docRef)
}