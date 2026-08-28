/**
 * adminMessagingService
 * Simule l'envoi d'un message depuis l'administration (ex : suite à
 * la supervision d'un ticket). À remplacer par une écriture Firestore
 * (ou un appel à un service de notification) quand le backend sera
 * disponible.
 */
export async function sendMessage(payload) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    id: `msg-${Date.now()}`,
    ...payload,
  }
}