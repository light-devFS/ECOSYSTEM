import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

/**
 * Récupère l'historique des conversations de l'utilisateur
 */
export async function getHistory() {
  const user = auth.currentUser
  if (!user) return []

  const q = query(
    collection(db, 'chatHistory'),
    where('userId', '==', user.uid),
    orderBy('timestamp', 'asc')
  )
  const snapshot = await getDocs(q)

  const messages = []
  snapshot.forEach((doc) => {
    messages.push({ id: doc.id, ...doc.data() })
  })
  return messages
}

/**
 * Envoie un message et stocke la réponse simulée (à remplacer par une vraie IA plus tard)
 */
export async function sendMessage(message) {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur non connecté')

  // 1. Enregistrer le message de l'élève dans Firestore
  await addDoc(collection(db, 'chatHistory'), {
    userId: user.uid,
    author: 'eleve',
    text: message,
    timestamp: new Date(),
  })

  // 2. Simuler une réponse (à remplacer par un appel à une vraie IA)
  const replyText = `Je prends note de ta question : « ${message} ». Un vrai tuteur IA répondra ici une fois le backend connecté.`

  // 3. Enregistrer la réponse du tuteur dans Firestore
  const replyDocRef = await addDoc(collection(db, 'chatHistory'), {
    userId: user.uid,
    author: 'tuteur',
    text: replyText,
    timestamp: new Date(),
  })

  // 4. Retourner la réponse
  return {
    id: replyDocRef.id,
    author: 'tuteur',
    text: replyText,
  }
}