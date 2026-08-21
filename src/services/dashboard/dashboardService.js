import { mockDashboard } from '@/mock/dashboard'

/**
 * dashboardService
 * À remplacer par des lectures Firestore (ex: collection "students/{id}/progress")
 * quand le backend sera disponible. Les vues ne doivent jamais lire
 * mockDashboard directement.
 */
export async function getStudentDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockDashboard
}