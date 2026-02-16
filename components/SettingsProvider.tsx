"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("anthropic_api_key");
    if (storedKey) {
      setApiKeyState(storedKey);
    }
    setIsLoaded(true);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem("anthropic_api_key", key);
  };

  // Prevent hydration mismatch by not rendering until loaded, or just render children
  // For API key, it's fine to start empty and fill in.
  
  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
