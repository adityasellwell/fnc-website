"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const AuthContext = createContext({
  user: null,
  loading: true,
  isSignedIn: false,
  signOut: async () => {},
});

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      // Destroy server session cookie
      await fetch("/api/auth/session", { method: "DELETE" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const value = {
    user,
    loading,
    isSignedIn: !!user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
