import { mockGroups, mockAiSuggestion } from '@/mock/groups'

/**
 * groupService
 * À remplacer par des lectures/écritures Firestore quand le backend
 * sera disponible (collection "studyGroups", suggestions générées
 * côté serveur par le moteur IA).
 */
export async function getGroups() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockGroups
}

export async function getAiSuggestion() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockAiSuggestion
}