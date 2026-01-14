import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9BecTAJ3S1-7TJPqmyfya8Yq4EN71dWQ",
  authDomain: "skillgapanalyser.firebaseapp.com",
  projectId: "skillgapanalyser",
  storageBucket: "skillgapanalyser.firebasestorage.app",
  messagingSenderId: "588395797900",
  appId: "1:588395797900:web:dbf6673bc1055ece488aa9",
  measurementId: "G-MBVXH5NF1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence to local storage so user stays logged in
setPersistence(auth, browserLocalPersistence);

// Google Provider
export const googleProvider = new GoogleAuthProvider();

// Export auth functions
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
};
