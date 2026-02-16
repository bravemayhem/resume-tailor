import Link from "next/link";
import { FileText, Settings, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Resume Tailor
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link 
            href="/tailor"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-white dark:bg-gray-800 shadow-sm"
          >
            <h2 className={`mb-3 text-2xl font-semibold flex items-center gap-2`}>
              <PlusCircle className="w-6 h-6" />
              New Resume
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Tailor your master resume for a new job description.
            </p>
          </Link>

          <Link 
            href="/master-resume"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-white dark:bg-gray-800 shadow-sm"
          >
            <h2 className={`mb-3 text-2xl font-semibold flex items-center gap-2`}>
              <FileText className="w-6 h-6" />
              Master Resume
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Edit and manage your source of truth resume.
            </p>
          </Link>
          
          <Link 
            href="/settings"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-white dark:bg-gray-800 shadow-sm md:col-span-2"
          >
            <h2 className={`mb-3 text-2xl font-semibold flex items-center gap-2`}>
              <Settings className="w-6 h-6" />
              Settings
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Configure API keys and preferences.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
