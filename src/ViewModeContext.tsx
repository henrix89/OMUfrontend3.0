import React, { createContext, useContext, useEffect, useState } from "react";

interface ViewModeContextType {
  mobilvisning: boolean;
  toggleVisning: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hent tidligere lagret visning, eller start med mobil som standard
  const [mobilvisning, setMobilvisning] = useState<boolean>(() => {
    const saved = localStorage.getItem("mobilvisning");
    return saved === null ? true : saved === "true";
  });

  // Bytt og lagre ny visning
  const toggleVisning = () => {
    setMobilvisning((prev) => {
      const next = !prev;
      console.log("Bytter visning til:", next ? "mobil" : "PC");
      localStorage.setItem("mobilvisning", String(next));
      return next;
    });
  };

  return (
    <ViewModeContext.Provider value={{ mobilvisning, toggleVisning }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
};
