import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'
import { getPendingAssignments } from '@/services/assignments/assignmentService'

export async function getStudentDashboard() {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')

  const uid = user.uid

  // 1. Récupérer les données utilisateur
  const userDocRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userDocRef)
  if (!userSnap.exists()) {
    throw new Error('Document utilisateur introuvable')
  }
  const userData = userSnap.data()

  // 2. Récupérer les devoirs à faire via assignmentService
  const pendingAssignments = await getPendingAssignments(uid)
  const devoirsARendre = pendingAssignments.length

  // 3. Extraire la progression et les matières
  const progress = userData.progress || { overall: 0, streak: 0 }
  const subjects = userData.subjects || {}

  // 4. Transformer les matières en tableau pour les barres de progression
  const subjectsProgress = Object.entries(subjects).map(([label, percent]) => ({
    label,
    percent,
    color: getColorForSubject(label),
  }))

  // 5. Construire la liste des tâches à venir
  const tachesAVenir = pendingAssignments.map((assignment) => ({
    id: assignment.id,
    matiere: assignment.subject,
    type: assignment.type === 'devoir' ? 'Devoirs à rendre' : 'Révisions',
    titre: assignment.title,
    date: assignment.dueDate ? assignment.dueDate.toDate().toLocaleDateString() : "Aujourd'hui",
  }))
  // On limite à 2 pour rester fidèle à la maquette
  const limitedTaches = tachesAVenir.slice(0, 2)

  // 6. Tuteur IA (valeurs statiques pour l'instant)
  const tuteurIA = {
    difficulteDetectee: 'Fonctions exponentielles',
    maitrise: 42,
  }

  return {
    stats: {
      devoirsARendre: devoirsARendre,
      progression: progress.overall || 0,
      matiereAReviser: '08', // sera calculé plus tard
      streakJours: progress.streak || 0,
    },
    subjectsProgress,
    tuteurIA,
    tachesAVenir: limitedTaches,
  }
}

// Fonction utilitaire pour les couleurs des barres
function getColorForSubject(label) {
  const map = {
    Mathématiques: 'teal',
    Philosophie: 'warning',
    Anglais: 'danger',
    SVT: 'success',
  }
  return map[label] || 'primary'
}