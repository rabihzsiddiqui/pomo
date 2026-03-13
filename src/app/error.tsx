"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
        <p className="text-sm font-medium text-red-400">something went wrong</p>
        <pre className="text-xs text-zinc-400 bg-zinc-950 rounded-lg p-4 overflow-auto whitespace-pre-wrap break-all">
          {error.message}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm transition-colors duration-200"
        >
          try again
        </button>
      </div>
    </main>
  );
}
