import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  firebaseUid: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(firebaseApp);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Register or authenticate with backend
          const response = await apiRequest("POST", "/api/auth/firebase-auth", {
            firebaseUserId: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
          
          if (response.ok) {
            const userData = await response.json();
            
            const userInfo = {
              id: userData.id,
              email: firebaseUser.email || "",
              username: userData.username || "",
              displayName: firebaseUser.displayName,
              firebaseUid: firebaseUser.uid,
              stripeCustomerId: userData.stripeCustomerId,
              stripeSubscriptionId: userData.stripeSubscriptionId,
            };
            
            // Guardar información del usuario en localStorage para las peticiones de API
            try {
              localStorage.setItem('utale_user', JSON.stringify(userInfo));
            } catch (e) {
              console.error("Error guardando datos de usuario en localStorage:", e);
            }
            
            setUser(userInfo);
          } else {
            console.error("Error en respuesta del servidor:", await response.text());
            setUser(null);
          }
        } catch (error) {
          console.error("Error syncing user with backend:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Backend registration happens in the onAuthStateChanged callback
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Backend authentication happens in the onAuthStateChanged callback
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Backend authentication happens in the onAuthStateChanged callback
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      
      // Limpiar información de usuario en localStorage
      try {
        localStorage.removeItem('utale_user');
      } catch (e) {
        console.error("Error al limpiar datos de usuario de localStorage:", e);
      }
      
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};