import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCENiD21VzFTgEuiSDq6qhnGIK1Hx-9rq0",
  authDomain: "campusplus-studentportal.firebaseapp.com",
  projectId: "campusplus-studentportal",
  storageBucket: "campusplus-studentportal.firebasestorage.app",
  messagingSenderId: "307761833152",
  appId: "1:307761833152:web:a826333e8f53378eccb925",
  measurementId: "G-ZW1KKZB9DB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { auth, db, storage }
