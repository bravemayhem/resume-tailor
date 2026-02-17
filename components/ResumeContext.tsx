"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ResumeData } from "@/lib/resumeSchema";
import { createEmptyResume } from "@/lib/resumeSchema";
import { parseResumeText } from "@/lib/parseResumeText";

export interface ResumeVersion {
  id: string;
  savedAt: string;
  content: string;
}

interface ResumeContextType {
  masterResume: string;
  masterResumeData: ResumeData;
  masterResumeHistory: ResumeVersion[];
  setMasterResume: (content: string) => void;
  restoreMasterResume: (id: string) => void;
  deleteMasterResumeVersion: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [masterResume, setMasterResumeState] = useState("");
  const [masterResumeHistory, setMasterResumeHistory] = useState<ResumeVersion[]>([]);

  useEffect(() => {
    const storedResume = localStorage.getItem("master_resume");
    if (storedResume) {
      setMasterResumeState(storedResume);
    }

    const storedHistory = localStorage.getItem("master_resume_versions");
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory) as ResumeVersion[];
        if (Array.isArray(parsed)) {
          setMasterResumeHistory(parsed);
        }
      } catch {
        // Ignore invalid history in local storage.
      }
    }
  }, []);

  const setMasterResume = (content: string) => {
    setMasterResumeState(content);
    localStorage.setItem("master_resume", content);

    const normalized = content.trim();
    if (!normalized) {
      return;
    }

    setMasterResumeHistory((prev) => {
      if (prev[0]?.content === content) {
        return prev;
      }

      const next: ResumeVersion[] = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          savedAt: new Date().toISOString(),
          content,
        },
        ...prev,
      ];
      localStorage.setItem("master_resume_versions", JSON.stringify(next));
      return next;
    });
  };

  const restoreMasterResume = (id: string) => {
    const match = masterResumeHistory.find((version) => version.id === id);
    if (!match) return;

    setMasterResumeState(match.content);
    localStorage.setItem("master_resume", match.content);
  };

  const deleteMasterResumeVersion = (id: string) => {
    setMasterResumeHistory((prev) => {
      const next = prev.filter((version) => version.id !== id);
      localStorage.setItem("master_resume_versions", JSON.stringify(next));
      return next;
    });
  };

  const masterResumeData = useMemo<ResumeData>(() => {
    if (!masterResume.trim()) {
      return createEmptyResume();
    }
    return parseResumeText(masterResume);
  }, [masterResume]);

  return (
    <ResumeContext.Provider
      value={{
        masterResume,
        masterResumeData,
        masterResumeHistory,
        setMasterResume,
        restoreMasterResume,
        deleteMasterResumeVersion,
      }}
    >
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
