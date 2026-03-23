"use client";

import { useState } from "react";

interface Script {
  id: string;
  youtube_url: string;
  video_title: string | null;
  status: string;
  screenplay: string | null;
  created_at: string;
}

export default function MyScriptsPage() {
  const [email, setEmail] = useState("");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/scripts?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setScripts(data.scripts || []);
      setCredits(data.credits ?? 3);
      setPlan(data.plan || "free");
      setLoaded(true);
    } catch {
      alert("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(script: Script) {
    if (!script.screenplay) return;
    const blob = new Blob([script.screenplay], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.video_title || "screenplay"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">My Scripts</h1>
      <p className="text-[var(--muted)] mb-8">
        View and download your previously generated screenplays.
      </p>

      <form onSubmit={handleLookup} className="flex gap-3 mb-8">
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-white placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-medium px-6 py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Look Up"}
        </button>
      </form>

      {loaded && (
        <div>
          <div className="flex items-center justify-between mb-6 bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
            <div>
              <span className="text-sm text-[var(--muted)]">Plan: </span>
              <span className="font-medium capitalize">{plan}</span>
            </div>
            <div>
              <span className="text-sm text-[var(--muted)]">Credits: </span>
              <span className="font-medium">{credits}</span>
            </div>
            <a
              href="/pricing"
              className="text-[var(--primary)] text-sm hover:underline"
            >
              Upgrade Plan
            </a>
          </div>

          {scripts.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted)]">
              <p className="text-lg mb-4">No scripts yet</p>
              <a
                href="/convert"
                className="text-[var(--primary)] hover:underline"
              >
                Convert your first video
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {script.video_title || script.youtube_url}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {new Date(script.created_at).toLocaleDateString()} &middot;{" "}
                      <span
                        className={
                          script.status === "completed"
                            ? "text-green-400"
                            : script.status === "failed"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }
                      >
                        {script.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {script.screenplay && (
                      <>
                        <button
                          onClick={() => setSelectedScript(script)}
                          className="border border-[var(--border)] hover:border-[var(--muted)] px-3 py-1.5 rounded text-sm transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(script)}
                          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black px-3 py-1.5 rounded text-sm font-medium transition"
                        >
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Screenplay Viewer Modal */}
          {selectedScript && selectedScript.screenplay && (
            <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
              <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedScript.video_title || "Screenplay"}
                  </h2>
                  <button
                    onClick={() => setSelectedScript(null)}
                    className="border border-[var(--border)] hover:border-[var(--muted)] px-4 py-2 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
                <div className="screenplay">{selectedScript.screenplay}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
