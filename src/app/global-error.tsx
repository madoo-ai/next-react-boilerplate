"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#0b1020] p-6 text-center font-sans text-[#f5f7fb]">
        <p className="font-mono text-sm text-[#8b7cff]">500</p>
        <h1 className="text-3xl font-light tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-[#a5b4cf]">
          An unexpected error occurred. Try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#8b7cff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a6aef]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
