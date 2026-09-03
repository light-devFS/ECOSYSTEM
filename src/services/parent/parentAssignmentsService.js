import { mockAssignments } from '@/mock/parentAssignments'

/**
 * parentAssignmentsService
 * À remplacer par une lecture Firestore quand le backend sera disponible.
 */
export async function getAssignments() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockAssignments
}