import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUmRjZXkX2zkodBklZqESvZuKwxCDPODM",
  authDomain: "daily-problem-520.firebaseapp.com",
  projectId: "daily-problem-520",
  storageBucket: "daily-problem-520.firebasestorage.app",
  messagingSenderId: "714645975469",
  appId: "1:714645975469:web:20c82d8fbc90aa84247124",
  measurementId: "G-72MFQXC6Z5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = () => {
  signInWithRedirect(auth, googleProvider);
};

// Process redirect result on page load
getRedirectResult(auth).catch((error) => {
  console.error("Error processing redirect:", error);
});

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
