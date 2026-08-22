import { mockTutorHistory } from '@/mock/tutor'

/**
 * tutorService
 * getHistory() sera branché sur Firestore. sendMessage() sera branché
 * sur le vrai moteur du tuteur IA (hors périmètre de ce frontend) —
 * la réponse simulée ici sert uniquement à valider l'interface de chat.
 */
export async function getHistory() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockTutorHistory
}

export async function sendMessage(message) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    id: `r-${Date.now()}`,
    author: 'tuteur',
    text: `Je prends note de ta question : « ${message} ». Un vrai tuteur IA répondra ici une fois le backend connecté.`,
  }
}