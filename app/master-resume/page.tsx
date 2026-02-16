"use client";

import { useResume } from "@/components/ResumeContext";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

export default function MasterResumePage() {
  const { masterResume, setMasterResume } = useResume();
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(masterResume);
  }, [masterResume]);

  const handleSave = () => {
    setMasterResume(content);
    alert("Master resume saved!");
  };

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
      alert("Resume text extracted! You may need to format it slightly.");
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
    <div className="container mx-auto p-6 flex flex-col h-screen">
      <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Master Resume</h1>
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

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-6 resize-none focus:outline-none dark:bg-gray-900 dark:text-gray-100 font-mono text-sm"
          placeholder="# Your Name\n\n## Experience\n\n..."
        />
      </div>
    </div>
  );
}
