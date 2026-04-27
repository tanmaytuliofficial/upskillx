/**
 * UpSkillX — Firebase Configuration
 * Replace the placeholder values with your actual Firebase project config.
 * These are client-side keys — safe to include in frontend code.
 * Sensitive admin credentials live ONLY in Cloudflare environment variables.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, collection, getDocs,
  addDoc, updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ─────────────────────────────────────────────────────────────────────
//  🔧 REPLACE with your Firebase config (Firebase Console → Project Settings)
// ─────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCiwkkVG1_u5baSNTSXxelffZAP6eRjSh8",
  authDomain:        "upskillx-ca40b.firebaseapp.com",
  projectId:         "upskillx-ca40b",
  storageBucket:     "upskillx-ca40b.firebasestorage.app",
  messagingSenderId: "371139867631",
  appId:             "1:371139867631:web:a4cb4cc49d6f1210f9fc1a"
};
// ─────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export {
  GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile,
  doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, increment,
  ref, uploadBytes, getDownloadURL
};
