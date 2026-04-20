// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ✅ only store clean fields
        const token = await getIdToken(firebaseUser, true);
        setUser({
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        });
        setIdToken(token);
        localStorage.setItem("jwt", token);
        localStorage.setItem(
          "userName",
          firebaseUser.displayName || firebaseUser.email || "Trader"
        );
      } else {
        setUser(null);
        setIdToken(null);
        localStorage.removeItem("jwt");
        localStorage.removeItem("userName");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, idToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
