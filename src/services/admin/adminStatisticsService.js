import { mockStatistics } from '@/mock/adminStatistics'

/**
 * adminStatisticsService
 * À remplacer par des agrégats calculés côté backend quand celui-ci
 * sera disponible.
 */
export async function getStatistics() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockStatistics
}