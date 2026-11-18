"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

export const FIREBASE_WEB_CONFIG = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBPYqJCGEuQEEqu1VITNhXRZsCFPCIjZeg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "digitiles-bd.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "digitiles-bd",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "digitiles-bd.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "700109702504",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:700109702504:web:8b4dfc2afc57b57e1f82dd",
};

export function getFirebaseAuthClient() {
  const app = getApps().length === 0 ? initializeApp(FIREBASE_WEB_CONFIG) : getApp();
  return getAuth(app);
}

export async function loginWithGooglePopup() {
  const auth = getFirebaseAuthClient();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    uid: result.user.uid,
    email: result.user.email || "",
    displayName: result.user.displayName || result.user.email?.split("@")[0] || "DigiTiles User",
  };
}

export async function loginWithEmailPassword(email: string, password: string) {
  const auth = getFirebaseAuthClient();
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    uid: result.user.uid,
    email: result.user.email || email.trim(),
    displayName: result.user.displayName || email.split("@")[0] || "DigiTiles User",
  };
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
  fullName: string
) {
  const auth = getFirebaseAuthClient();
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (fullName.trim()) {
    await updateProfile(result.user, { displayName: fullName.trim() });
  }
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    uid: result.user.uid,
    email: result.user.email || email.trim(),
    displayName: fullName.trim() || result.user.displayName || email.split("@")[0],
  };
}

export async function signOutFirebaseClient() {
  try {
    const auth = getFirebaseAuthClient();
    await signOut(auth);
  } catch {
    // Ignore client sign-out errors if no active Firebase session
  }
}
