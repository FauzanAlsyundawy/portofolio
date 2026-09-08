"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-ink mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="inline-flex h-9 items-center justify-center rounded-md bg-signal-dark px-4 py-2 text-sm font-medium text-white hover:bg-signal"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
