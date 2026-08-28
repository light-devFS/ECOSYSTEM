import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * adminScheduleService
 * Emploi du temps stocké dans "schedule/{classe}" + liste des classes
 * réelles (collection "classes").
 */

export async function getSchedule(classe) {
  const classesSnap = await getDocs(collection(db, 'classes'))
  const classes = []
  classesSnap.forEach((docu) => {
    const name = docu.data().name
    if (name) classes.push(name)
  })

  const ref = doc(db, 'schedule', classe)
  const snap = await getDoc(ref)
  const data = snap.exists() ? snap.data() : {}

  return {
    classes,
    jours: Array.isArray(data.jours) ? data.jours : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    creneaux: Array.isArray(data.creneaux) ? data.creneaux : [],
    evenements: Array.isArray(data.evenements) ? data.evenements : [],
  }
}