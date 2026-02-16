"use client";

import { useSettings } from "@/components/SettingsProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  // Use a try-catch or check if context exists to avoid errors during SSR if not wrapped properly
  // But since we wrapped in layout, it should be fine.
  // However, useSettings throws if context is missing.
  
  // We need to handle the case where we are rendering on server (though "use client" makes this a client component,
  // the initial render might not have context available if not set up correctly).
  // But RootLayout wraps it, so it should be fine.
  
  const { apiKey, setApiKey } = useSettings();
  const [inputKey, setInputKey] = useState("");

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(inputKey);
    alert("Settings saved!");
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <h1 className="mb-6 text-3xl font-bold">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
            Anthropic API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
            placeholder="sk-ant-..."
          />
          <p className="text-sm text-gray-500 mt-2">
            You can also set the <code>ANTHROPIC_API_KEY</code> environment variable on your server. If set, this field is optional.
            <br />
            When provided here, your key is stored locally in your browser and sent securely to the backend only for processing requests. It is never stored permanently on the server.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
