import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { getChildUid } from '@/services/parent/childSelector'

/**
 * parentMessagingService
 * Messagerie encadrée : messages de l'établissement adressés à l'enfant
 * du parent (collection "messages"). L'établissement reste le seul
 * émetteur (modération côté admin).
 */
export async function getMessages() {
  const childUid = await getChildUid()
  const snapshot = await getDocs(query(collection(db, 'messages'), where('childUid', '==', childUid)))

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    categorie: doc.data().categorie || 'administration',
    auteur: doc.data().auteur || 'Établissement',
    role: doc.data().role || '',
    extrait: doc.data().extrait || '',
    lu: Boolean(doc.data().lu),
  }))
}