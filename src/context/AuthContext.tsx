import React, { createContext, useContext, useState, ReactNode } from "react";

interface Bruker {
  brukernavn: string;
  rolle: string;
  firmaId: string;
}

interface AuthContextType {
  bruker: Bruker | null;
  login: (data: Bruker) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [bruker, setBruker] = useState<Bruker | null>(null);

  const login = (data: Bruker) => {
    setBruker(data);
    localStorage.setItem("innloggetBruker", JSON.stringify(data));
  };

  const logout = () => {
    setBruker(null);
    localStorage.removeItem("innloggetBruker");
  };

  return (
    <AuthContext.Provider value={{ bruker, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth må brukes innenfor AuthProvider");
  }
  return context;
};

export {};
