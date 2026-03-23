"use client";

import { useState } from "react";

export default function ConvertPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenplay, setScreenplay] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setScreenplay("");
    setLoading(true);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "NO_CREDITS") {
          setError("No credits remaining. Please upgrade your plan.");
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      setScreenplay(data.screenplay);
      setVideoTitle(data.videoTitle);
      setCredits(data.creditsRemaining);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(screenplay);
  }

  function handleDownload() {
    const blob = new Blob([screenplay], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoTitle || "screenplay"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Convert Video to Screenplay</h1>
      <p className="text-[var(--muted)] mb-8">
        Paste a YouTube URL (max 2 minutes, English only) and enter your email
        to get started.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium mb-1">
            YouTube URL
          </label>
          <input
            id="youtube-url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-white placeholder:text-[var(--muted)]"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-white placeholder:text-[var(--muted)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-lg transition text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating screenplay...
            </span>
          ) : (
            "Convert to Screenplay"
          )}
        </button>

        {credits !== null && (
          <p className="text-sm text-[var(--muted)] text-center">
            Credits remaining: {credits}{" "}
            {credits <= 1 && (
              <a href="/pricing" className="text-[var(--primary)] underline">
                Upgrade
              </a>
            )}
          </p>
        )}
      </form>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-8">
          <p className="text-red-400">{error}</p>
          {error.includes("credits") && (
            <a
              href="/pricing"
              className="text-[var(--primary)] underline text-sm mt-2 inline-block"
            >
              View pricing plans
            </a>
          )}
        </div>
      )}

      {screenplay && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Screenplay</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="border border-[var(--border)] hover:border-[var(--muted)] px-4 py-2 rounded-lg text-sm transition"
              >
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Download .txt
              </button>
            </div>
          </div>
          <div className="screenplay">{screenplay}</div>
        </div>
      )}
    </div>
  );
}
