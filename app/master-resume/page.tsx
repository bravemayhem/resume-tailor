"use client";

import { useResume } from "@/components/ResumeContext";
import ResumeTemplate, {
  DEFAULT_RESUME_STYLE,
  type ResumeStyleSettings,
} from "@/components/ResumeTemplate";
import { parseResumeText } from "@/lib/parseResumeText";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

export default function MasterResumePage() {
  const {
    masterResume,
    setMasterResume,
    masterResumeHistory,
    restoreMasterResume,
    deleteMasterResumeVersion,
  } = useResume();
  const [content, setContent] = useState("");
  const [styleSettings, setStyleSettings] = useState<ResumeStyleSettings>(DEFAULT_RESUME_STYLE);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(masterResume);
  }, [masterResume]);

  useEffect(() => {
    const stored = localStorage.getItem("resume_style_settings");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<ResumeStyleSettings>;
      setStyleSettings({ ...DEFAULT_RESUME_STYLE, ...parsed });
    } catch {
      // Ignore invalid local storage values.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("resume_style_settings", JSON.stringify(styleSettings));
  }, [styleSettings]);

  const handleSave = () => {
    setMasterResume(content);
    alert("Master resume saved!");
  };

  const resumeData = useMemo(() => parseResumeText(content), [content]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extractpdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract text");
      }

      setContent(data.text);
    } catch (error) {
      console.error(error);
      alert("Failed to upload resume.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Master Resume</h1>
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Import PDF
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Main: editor + preview side-by-side */}
      <main className="flex-1 flex min-h-0">
        {/* Left: raw text editor */}
        <div className="w-2/5 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Style
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                Font
                <select
                  value={styleSettings.fontFamily}
                  onChange={(e) =>
                    setStyleSettings((prev) => ({
                      ...prev,
                      fontFamily: e.target.value as ResumeStyleSettings["fontFamily"],
                    }))
                  }
                  className="border rounded px-2 py-1 dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="times">Times New Roman</option>
                  <option value="georgia">Georgia</option>
                  <option value="arial">Arial</option>
                  <option value="helvetica">Helvetica</option>
                  <option value="calibri">Calibri</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                Font Size ({styleSettings.baseFontSizePt.toFixed(1)}pt)
                <input
                  type="range"
                  min={9}
                  max={12}
                  step={0.5}
                  value={styleSettings.baseFontSizePt}
                  onChange={(e) =>
                    setStyleSettings((prev) => ({
                      ...prev,
                      baseFontSizePt: Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                Line Height ({styleSettings.lineHeight.toFixed(2)})
                <input
                  type="range"
                  min={1.2}
                  max={1.6}
                  step={0.05}
                  value={styleSettings.lineHeight}
                  onChange={(e) =>
                    setStyleSettings((prev) => ({
                      ...prev,
                      lineHeight: Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                Role Spacing ({styleSettings.entrySpacingPx}px)
                <input
                  type="range"
                  min={4}
                  max={16}
                  step={1}
                  value={styleSettings.entrySpacingPx}
                  onChange={(e) =>
                    setStyleSettings((prev) => ({
                      ...prev,
                      entrySpacingPx: Number(e.target.value),
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Resume Text
          </div>

          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
              Saved Versions ({masterResumeHistory.length})
            </p>
            {masterResumeHistory.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No saved snapshots yet. Click Save Changes to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {masterResumeHistory.map((version) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 dark:border-gray-700 rounded p-2"
                  >
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-1">
                      {new Date(version.savedAt).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {version.content.slice(0, 140)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          restoreMasterResume(version.id);
                          setContent(version.content);
                        }}
                        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMasterResumeVersion(version.id)}
                        className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-4 resize-none focus:outline-none dark:bg-gray-900 dark:text-gray-100 font-mono text-[11px] leading-relaxed"
            placeholder={"BROOKLYN F BELTRAN\nbrooklyn@email.com • linkedin.com/in/example • (555) 555-5555\n\nWORK EXPERIENCE\nSoftware Engineer @ Company  January 2024 – Present\n• Built amazing features..."}
          />
        </div>

        {/* Right: formatted preview */}
        <div className="w-3/5 bg-gray-100 dark:bg-gray-950 overflow-y-auto">
          <div className="p-8 flex justify-center">
            <div className="bg-white shadow-lg w-[8.5in] min-h-[11in] px-[0.7in] py-[0.5in]">
              {content.trim() ? (
                <ResumeTemplate data={resumeData} styleSettings={styleSettings} />
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center text-gray-400 text-sm">
                  Import a PDF or type resume text on the left to see the formatted preview.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
