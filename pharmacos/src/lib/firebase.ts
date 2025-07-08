// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKiWPo9YwzIVkZq-k1-ACy2JUPTdfWQAA",
  authDomain: "pharmacos-manager-websit-93f48.firebaseapp.com",
  projectId: "pharmacos-manager-websit-93f48",
  storageBucket: "pharmacos-manager-websit-93f48.firebasestorage.app",
  messagingSenderId: "108812632414",
  appId: "1:108812632414:web:3666519a2b3242c8becfcf",
  measurementId: "G-C0L3CVX7KD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
