import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

/**
 * Configuration Firebase du projet EduSphere.
 * Ces valeurs ne sont pas des secrets (elles identifient le projet
 * Firebase, elles ne donnent pas d'accès en soi) : c'est normal
 * qu'elles soient présentes côté frontend. La vraie sécurité est
 * assurée par les règles Firestore/Storage côté backend.
 *
 * Aucun composant ni service métier ne doit importer directement
 * "firebase/app" ailleurs que dans ce fichier : ils importent
 * uniquement `app`, `auth`, `db` ou `functions` depuis ici.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyBjuLCYIJA70Y8APLO0KZs2JGgCfei-z00',
  authDomain: 'ecosystem-a3163.firebaseapp.com',
  projectId: 'ecosystem-a3163',
  storageBucket: 'ecosystem-a3163.firebasestorage.app',
  messagingSenderId: '469723214246',
  appId: '1:469723214246:web:5186836f652650586f9f67',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, 'us-central1')