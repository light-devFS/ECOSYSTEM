import { mockSchedule } from '@/mock/adminSchedule'

/**
 * adminScheduleService
 * À remplacer par une lecture Firestore (emploi du temps par classe)
 * quand le backend sera disponible. Le paramètre classe est déjà
 * prévu pour ce filtrage futur côté serveur.
 */
export async function getSchedule(classe) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockSchedule
}