import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDcuzFtA6z1oV_KHeW504FYw3k3Ybjzt_c",
    authDomain: "cinereserve-pro.firebaseapp.com",
    projectId: "cinereserve-pro",
    storageBucket: "cinereserve-pro.firebasestorage.app",
    messagingSenderId: "816200528966",
    appId: "1:816200528966:web:bd05dbb368139756a50647",
};

// Initialize Firebase (Check if app is already initialized to prevent HMR duplicate app error)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
