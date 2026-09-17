'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">A critical error occurred</h2>
          <p className="text-gray-500 mb-6">{error.message || 'The application encountered an unexpected error.'}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Recover Application
          </button>
        </div>
      </body>
    </html>
  );
}
