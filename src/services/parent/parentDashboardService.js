import { mockParentDashboard } from '@/mock/parentDashboard'

/**
 * parentDashboardService
 * À remplacer par une lecture Firestore (données de l'enfant lié au
 * compte parent) quand le backend sera disponible.
 */
export async function getParentDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockParentDashboard
}