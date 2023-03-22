import { getFirestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

var firebaseConfig = {
  apiKey: 'AIzaSyBZkJLsBkODrUBduBMJqRpoYO2gWshiRa4',
  authDomain: 'birb-367722.firebaseapp.com',
  projectId: 'birb-367722',
  storageBucket: 'birb-367722.appspot.com',
  messagingSenderId: '843966030829',
  appId: '1:843966030829:web:5eeeb1a7d4a0e121b93de4',
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)

console.log('firebase.js', firebaseApp)
console.log('firebase.js', db)

export { firebaseApp, db }
