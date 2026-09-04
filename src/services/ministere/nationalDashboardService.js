import { mockNationalDashboard } from '@/mock/ministereDashboard'

/**
 * nationalDashboardService
 * À remplacer par une lecture Firestore (agrégats nationaux calculés
 * côté backend) quand celui-ci sera disponible.
 */
export async function getNationalDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockNationalDashboard
}