"use client";

import { useSettings } from "@/components/SettingsProvider";
import { useResume } from "@/components/ResumeContext";
import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Download, Palette } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useReactToPrint } from "react-to-print";

const templates = {
  modern: {
    name: "Modern",
    h1: "text-4xl font-bold mb-2 text-gray-900",
    h2: "text-xl font-bold mt-6 mb-3 uppercase tracking-wide border-b-2 border-gray-900 pb-1",
    h3: "text-lg font-semibold mt-4 mb-1",
    p: "mb-2 text-gray-700 leading-relaxed",
    ul: "list-disc pl-5 mb-4 space-y-1",
    li: "text-gray-700",
  },
  classic: {
    name: "Classic",
    h1: "text-3xl font-serif font-bold mb-4 text-center border-b pb-4",
    h2: "text-lg font-serif font-bold mt-6 mb-2 uppercase border-b border-gray-400 pb-1",
    h3: "text-md font-serif font-bold mt-4 mb-1",
    p: "mb-2 text-gray-900 font-serif leading-relaxed",
    ul: "list-disc pl-5 mb-4 space-y-1 font-serif",
    li: "text-gray-900 font-serif",
  },
  minimal: {
    name: "Minimal",
    h1: "text-3xl font-light mb-6 tracking-tight",
    h2: "text-sm font-bold mt-8 mb-4 uppercase tracking-widest text-gray-500",
    h3: "text-base font-medium mt-4 mb-2",
    p: "mb-3 text-gray-600 text-sm leading-relaxed",
    ul: "list-none pl-0 mb-6 space-y-2 text-sm text-gray-600",
    li: "text-gray-600 text-sm",
  },
};

type TemplateKey = keyof typeof templates;

export default function TailorPage() {
  const { apiKey } = useSettings();
  const { masterResume } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("modern");
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleTailor = async () => {
    // We allow empty apiKey here because it might be set on the server via env vars.
    // The backend will validate if a key is available.
    
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
             alert("Please set your API key in settings or configure ANTHROPIC_API_KEY in your environment variables.");
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

  const styles = templates[activeTemplate];

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">New Resume</h1>
        </div>
        <div className="flex gap-2 items-center">
          {tailoredResume && (
            <div className="mr-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <select
                value={activeTemplate}
                onChange={(e) => setActiveTemplate(e.target.value as TemplateKey)}
                className="text-sm border rounded-md p-1 dark:bg-gray-700 dark:border-gray-600"
              >
                {Object.entries(templates).map(([key, t]) => (
                  <option key={key} value={key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleTailor}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Tailored Resume"}
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
                  Tailored Resume (Markdown)
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

        {/* Right Panel: Preview */}
        <div className="w-2/3 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-8 flex justify-center">
          <div 
            ref={resumeRef}
            className="bg-white text-black shadow-lg w-[210mm] min-h-[297mm] p-[20mm] text-sm leading-relaxed print:shadow-none print:w-full print:h-auto print:m-0 print:p-[10mm] print:absolute print:top-0 print:left-0 print:z-50"
          >
            {tailoredResume ? (
              <div className="markdown-preview">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className={styles.h1} {...props} />,
                    h2: ({node, ...props}) => <h2 className={styles.h2} {...props} />,
                    h3: ({node, ...props}) => <h3 className={styles.h3} {...props} />,
                    p: ({node, ...props}) => <p className={styles.p} {...props} />,
                    ul: ({node, ...props}) => <ul className={styles.ul} {...props} />,
                    li: ({node, ...props}) => <li className={styles.li} {...props} />,
                  }}
                >
                  {tailoredResume}
                </ReactMarkdown>
              </div>
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
