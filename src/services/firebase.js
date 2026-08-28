import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'


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