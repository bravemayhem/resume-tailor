"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ResumeContextType {
  masterResume: string;
  setMasterResume: (content: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [masterResume, setMasterResumeState] = useState("");

  useEffect(() => {
    const storedResume = localStorage.getItem("master_resume");
    if (storedResume) {
      setMasterResumeState(storedResume);
    }
  }, []);

  const setMasterResume = (content: string) => {
    setMasterResumeState(content);
    localStorage.setItem("master_resume", content);
  };

  return (
    <ResumeContext.Provider value={{ masterResume, setMasterResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
