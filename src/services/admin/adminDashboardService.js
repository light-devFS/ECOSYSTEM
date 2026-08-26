import { mockAdminDashboard } from '@/mock/adminDashboard'

/**
 * adminDashboardService
 * À remplacer par une lecture Firestore (agrégats calculés côté
 * backend) quand le backend sera disponible.
 */
export async function getAdminDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockAdminDashboard
}