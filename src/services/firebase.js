import { initializeApp } from 'firebase/app'

/**
 * Configuration Firebase du projet EduSphere.
 * Ces valeurs ne sont pas des secrets (elles identifient le projet
 * Firebase, elles ne donnent pas d'accès en soi) : c'est normal
 * qu'elles soient présentes côté frontend. La vraie sécurité est
 * assurée par les règles Firestore/Storage côté backend.
 *
 * Aucun composant ni service métier ne doit importer directement
 * "firebase/app" ailleurs que dans ce fichier : ils importent
 * uniquement `app` depuis ici (ou les instances auth/db exportées
 * au fur et à mesure des besoins).
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