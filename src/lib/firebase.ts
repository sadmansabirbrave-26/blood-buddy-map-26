import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdG2L2iLe0U4hXz2YuFgQHt84GmkZpfKw",
  authDomain: "blood-buddy-map.firebaseapp.com",
  projectId: "blood-buddy-map",
  storageBucket: "blood-buddy-map.firebasestorage.app",
  messagingSenderId: "714328732979",
  appId: "1:714328732979:web:e39d103830c3f7ceccfa46",
  measurementId: "G-BXG77PQCY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
