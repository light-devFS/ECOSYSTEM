import { mockProfDashboard } from '@/mock/profDashboard'

/**
 * profDashboardService
 * À remplacer par une lecture Firestore (agrégats par professeur)
 * quand le backend sera disponible.
 */
export async function getProfDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockProfDashboard
}