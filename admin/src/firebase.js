import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    // Aquí irá tu configuración de Firebase
    // Deberás copiarla desde la consola de Firebase
    apiKey: "AIzaSyAuRepwaZVBUWTQBVjxFMk2-tQwjyKvOMM",
    authDomain: "charys-clothes-store.firebaseapp.com",
    projectId: "charys-clothes-store",
    storageBucket: "charys-clothes-store.firebasestorage.app",
    messagingSenderId: "1093227114993",
    appId: "1:1093227114993:web:4665123517b5cbba401450",
    measurementId: "G-V6LB2GLWYT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 