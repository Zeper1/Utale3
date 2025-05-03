import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "290082779890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-NLQK6PJVCC"
};

// Implementar patrón singleton para evitar inicializaciones múltiples
// Solo inicializar Firebase si aún no hay una instancia
let firebaseApp;
try {
  // Si ya existe una app, usarla
  if (getApps().length) {
    firebaseApp = getApp();
  } else {
    // Si no, inicializar una nueva app
    firebaseApp = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Error inicializando Firebase: ", error);
  // Inicializar con un nombre alternativo si hay un error
  firebaseApp = initializeApp(firebaseConfig, "utale-app");
}

export { firebaseApp };
export const auth = getAuth(firebaseApp);
