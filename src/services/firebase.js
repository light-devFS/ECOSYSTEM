import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'


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

// En développement : tout tourne sur les émulateurs locaux (aucun appel au cloud).
// En production (npm run build), ce bloc est ignoré : on utilise le vrai backend.
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8090)
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}