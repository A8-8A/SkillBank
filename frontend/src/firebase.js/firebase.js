import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBqqkCgQaJD9AqEczbxoA3V1vmKMIXpWVs",
  authDomain: "skillbank-489a8.firebaseapp.com",
  projectId: "skillbank-489a8",
  storageBucket: "skillbank-489a8.firebasestorage.app",
  messagingSenderId: "798048632625",
  appId: "1:798048632625:web:09191ae976866099e97a10",
  measurementId: "G-S48VWWJ3Z4"
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const storage = getStorage(app)

export { app, analytics, storage }
