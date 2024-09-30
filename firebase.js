// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnz_TQ7j7wxNTnuGljX7zjF1q4m6hn1TQ",
  authDomain: "schoolrideshare-f516a.firebaseapp.com",
  projectId: "schoolrideshare-f516a",
  storageBucket: "schoolrideshare-f516a.appspot.com",
  messagingSenderId: "302545324526",
  appId: "1:302545324526:web:28f420b5583840b64666ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth();