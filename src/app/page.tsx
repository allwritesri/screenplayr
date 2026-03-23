export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Turn YouTube Videos into
            <span className="text-[var(--primary)]"> Movie Scripts</span>
          </h1>
          <p className="text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto">
            Paste a YouTube link, get a professionally formatted screenplay in
            seconds. AI-powered script generation with proper structure, scene
            headings, dialogue, and action lines.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/convert"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-semibold px-8 py-3 rounded-lg text-lg transition"
            >
              Try Free — 3 Credits
            </a>
            <a
              href="/pricing"
              className="border border-[var(--border)] hover:border-[var(--muted)] px-8 py-3 rounded-lg text-lg transition"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Paste YouTube URL",
                desc: "Drop any YouTube video link (up to 2 minutes). We extract the English transcript automatically.",
              },
              {
                step: "2",
                title: "AI Generates Script",
                desc: "Our AI analyzes the transcript and converts it into a properly formatted screenplay with scenes, dialogue, and action.",
              },
              {
                step: "3",
                title: "Download & Use",
                desc: "Get your screenplay instantly. Copy, download, or share it. Industry-standard formatting included.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-black font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Professional Screenplay Format
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Scene Headings",
                desc: "Automatic INT./EXT. slug lines with location and time of day",
              },
              {
                title: "Character Detection",
                desc: "AI identifies speakers and formats character names in proper CAPS",
              },
              {
                title: "Dialogue Formatting",
                desc: "Clean, centered dialogue with parenthetical stage directions",
              },
              {
                title: "Action Lines",
                desc: "Visual descriptions written in present tense, just like real scripts",
              },
              {
                title: "Scene Transitions",
                desc: "CUT TO, FADE IN/OUT, and other transitions placed correctly",
              },
              {
                title: "Industry Standard",
                desc: "Output follows Hollywood screenplay formatting conventions",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 bg-[var(--card)] border border-[var(--border)] rounded-lg p-6"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Convert Your First Video?
          </h2>
          <p className="text-[var(--muted)] mb-8">
            Start with 3 free conversions. No credit card required.
          </p>
          <a
            href="/convert"
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-semibold px-8 py-3 rounded-lg text-lg transition inline-block"
          >
            Start Converting
          </a>
        </div>
      </section>
    </div>
  );
}
