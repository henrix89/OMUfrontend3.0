// src/context/UserContext.tsx
import React, { createContext, useContext, useState } from "react";

interface Bruker {
  brukernavn: string;
  rolle: string;
  firmaId: string;
}

interface UserContextType {
  bruker: Bruker | null;
  setBruker: (b: Bruker | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bruker, setBruker] = useState<Bruker | null>(null);

  return (
    <UserContext.Provider value={{ bruker, setBruker }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser må brukes inni <UserProvider>");
  return context;
};
