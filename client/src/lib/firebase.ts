import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Using placeholder values until the actual Firebase config is provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "dummy-app-id"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
