import { mockMessages } from '@/mock/parentMessages'

/**
 * parentMessagingService
 * À remplacer par une lecture Firestore (messagerie modérée par
 * l'établissement) quand le backend sera disponible.
 */
export async function getMessages() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockMessages
}