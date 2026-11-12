"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center font-sans">
        <p className="text-sm font-medium text-primary">500</p>
        <h1 className="text-2xl font-light tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. Try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
