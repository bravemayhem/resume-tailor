"use client";

import { useSettings } from "@/components/SettingsProvider";
import { useResume } from "@/components/ResumeContext";
import ResumeTemplate, {
  DEFAULT_RESUME_STYLE,
  type ResumeStyleSettings,
} from "@/components/ResumeTemplate";
import { parseResumeText } from "@/lib/parseResumeText";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";

export default function TailorPage() {
  const { apiKey } = useSettings();
  const { masterResume } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [styleSettings, setStyleSettings] = useState<ResumeStyleSettings>(DEFAULT_RESUME_STYLE);
  const [isLoading, setIsLoading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const tailoredData = useMemo(
    () => (tailoredResume ? parseResumeText(tailoredResume) : null),
    [tailoredResume]
  );

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

  const handleTailor = async () => {
    if (!masterResume) {
      alert("Please set your Master Resume first.");
      return;
    }
    if (!jobDescription) {
      alert("Please enter a job description.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, masterResume, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "API Key is required") {
          alert(
            "Please set your API key in settings or configure ANTHROPIC_API_KEY in your environment variables."
          );
          return;
        }
        throw new Error(data.error || "Failed to tailor resume");
      }

      setTailoredResume(data.content);
    } catch (error) {
      console.error(error);
      alert("Failed to tailor resume. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
    documentTitle: "Tailored_Resume",
  });

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">New Resume</h1>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleTailor}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Generate Tailored Resume"
            )}
          </button>

          {tailoredResume && (
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Inputs & Editor */}
        <div className="w-1/3 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 overflow-y-auto print:hidden">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-40 p-3 border rounded-md dark:bg-gray-900 dark:border-gray-700 text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste the job description here..."
              />
            </div>

            {tailoredResume && (
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tailored Resume Text
                </label>
                <textarea
                  value={tailoredResume}
                  onChange={(e) => setTailoredResume(e.target.value)}
                  className="w-full h-[500px] p-3 border rounded-md dark:bg-gray-900 dark:border-gray-700 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Formatted Preview */}
        <div className="w-2/3 bg-gray-100 dark:bg-gray-950 overflow-y-auto p-8 flex justify-center">
          <div
            ref={resumeRef}
            className="bg-white text-black shadow-lg w-[8.5in] min-h-[11in] px-[0.7in] py-[0.5in] print:shadow-none print:w-full print:h-auto print:m-0 print:p-[0.5in] print:absolute print:top-0 print:left-0 print:z-50"
          >
            {tailoredData ? (
              <ResumeTemplate data={tailoredData} styleSettings={styleSettings} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>Preview will appear here after generation.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
