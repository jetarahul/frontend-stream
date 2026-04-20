// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdpnJ7VATKyBjXmd_1TnTipv5KlVMNJ4o",
  authDomain: "algo-trading-platform-490704.firebaseapp.com",
  projectId: "algo-trading-platform-490704",
  storageBucket: "algo-trading-platform-490704.appspot.com",
  messagingSenderId: "820892686232",
  appId: "1:820892686232:web:7cca3bd236884ccbdcbded"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firestore (you already had this)
export const db = getFirestore(app);

// ✅ Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
