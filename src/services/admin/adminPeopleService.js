import { mockEleves, mockEnseignants } from '@/mock/adminPeople'

/**
 * adminPeopleService
 * À remplacer par une lecture Firestore (collections "students" et
 * "teachers" de l'établissement) quand le backend sera disponible.
 */
export async function getEleves() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockEleves
}

export async function getEnseignants() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockEnseignants
}