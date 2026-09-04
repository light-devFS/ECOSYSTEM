import { mockContenusIA } from '@/mock/contenusIA'

/**
 * contenusIAService
 * À remplacer par une lecture/écriture Firestore quand le backend
 * sera disponible (validation persistée côté serveur).
 */
export async function getContenusIA() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockContenusIA
}

/**
 * getContenuById / updateContenu manipulent le même tableau mockContenusIA
 * que getContenusIA() : une modification faite sur la page d'édition est
 * donc bien visible en revenant sur la liste, sans backend derrière pour
 * l'instant.
 */
export async function getContenuById(id) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockContenusIA.find((contenu) => contenu.id === id) || null
}

export async function updateContenu(id, changes) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const contenu = mockContenusIA.find((item) => item.id === id)
  if (contenu) Object.assign(contenu, changes)
  return contenu
}