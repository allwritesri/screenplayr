// One-off E2E check: exercises the Claude screenplay-generation step
// against a sample transcript (since outbound to youtube.com is blocked
// in this sandbox, we substitute a fixed transcript here).
import * as fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

// Load .env (avoid extra dependency)
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const SAMPLE_TRANSCRIPT = `Hey there, welcome back to my channel. Today I'm standing in front of the elephants and they have really long trunks, which is cool. And that's pretty much all there is to say.`;

const SYSTEM = `You are a professional screenwriter and script formatter. Convert the transcript into a properly formatted movie screenplay.

FORMAT:
- SCENE HEADINGS in CAPS: INT./EXT. LOCATION - TIME OF DAY
- ACTION LINES in present tense
- CHARACTER NAMES centered, in CAPS
- DIALOGUE centered below character name
- Use FADE IN: and FADE OUT.

Return ONLY the screenplay text.`;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const t0 = Date.now();
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Convert this transcript into a movie screenplay.\n\nTRANSCRIPT:\n${SAMPLE_TRANSCRIPT}`,
      },
    ],
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  const text = message.content.find((b) => b.type === "text")?.text ?? "(no text)";
  console.log(`--- Screenplay generated in ${elapsed}s ---\n`);
  console.log(text);
  console.log(`\n--- Tokens: input=${message.usage.input_tokens}, output=${message.usage.output_tokens} ---`);
}

main().catch((e) => {
  console.error("E2E failed:", e?.message ?? e);
  process.exit(1);
});
