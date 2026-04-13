import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL1R4ChPoX0EDpU3XU639nlP6j49CkJ30",
  authDomain: "algo-trading-ui-df4ca.firebaseapp.com",
  projectId: "algo-trading-ui-df4ca",
  storageBucket: "algo-trading-ui-df4ca.firebasestorage.app",
  messagingSenderId: "805091534048",
  appId: "1:805091534048:web:387bc8ae36b31368b49c85",
  measurementId: "G-F0E3K69KQK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
