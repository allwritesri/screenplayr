import Anthropic from "@anthropic-ai/sdk";
import { FrameData } from "./video";

const SCREENPLAY_SYSTEM_PROMPT = `You are a professional screenwriter and script formatter. Your job is to convert video transcripts into properly formatted movie screenplays following industry-standard screenplay format.

SCREENPLAY FORMAT RULES:
1. SCENE HEADINGS (Slug Lines): Always in CAPS. Format: INT./EXT. LOCATION - TIME OF DAY
2. ACTION LINES: Written in present tense, describe what we SEE and HEAR. Normal case.
3. CHARACTER NAMES: Centered and in CAPS above their dialogue.
4. DIALOGUE: Centered below the character name.
5. PARENTHETICALS: Brief acting directions in parentheses below character name, before dialogue.
6. TRANSITIONS: Right-aligned, in CAPS (CUT TO:, FADE IN:, FADE OUT:, etc.)
7. Use FADE IN: at the beginning and FADE OUT. at the end.

IMPORTANT GUIDELINES:
- Analyze the transcript to identify different speakers/characters
- If speakers can't be identified, use descriptive names like NARRATOR, SPEAKER 1, HOST, GUEST etc.
- Add scene descriptions based on context clues in the transcript
- Break the transcript into logical scenes
- Add appropriate action lines describing implied visuals
- Maintain the original meaning and content of the transcript
- Keep dialogue natural — clean up filler words (um, uh, like) unless they serve characterization
- Add (V.O.) for voiceover narration, (O.S.) for off-screen dialogue where appropriate

OUTPUT FORMAT:
Return ONLY the formatted screenplay text. No explanations, no markdown code blocks, no commentary. Just the screenplay itself.`;

const SCREENPLAY_VISION_SYSTEM_PROMPT = `You are a professional screenwriter and script formatter. Your job is to convert video content — both its transcript AND visual frames — into properly formatted movie screenplays following industry-standard screenplay format.

SCREENPLAY FORMAT RULES:
1. SCENE HEADINGS (Slug Lines): Always in CAPS. Format: INT./EXT. LOCATION - TIME OF DAY
2. ACTION LINES: Written in present tense, describe what we SEE and HEAR. Normal case.
3. CHARACTER NAMES: Centered and in CAPS above their dialogue.
4. DIALOGUE: Centered below the character name.
5. PARENTHETICALS: Brief acting directions in parentheses below character name, before dialogue.
6. TRANSITIONS: Right-aligned, in CAPS (CUT TO:, FADE IN:, FADE OUT:, etc.)
7. Use FADE IN: at the beginning and FADE OUT. at the end.

IMPORTANT GUIDELINES:
- Use the visual frames to accurately describe locations, settings, lighting, and time of day
- Use the visual frames to identify characters by appearance, clothing, and physical actions
- Detect scene changes from visual shifts between frames
- Capture silent/visual-only moments that the transcript misses (reactions, action, B-roll)
- Analyze the transcript to identify different speakers and match them to characters you see in the frames
- If speakers can't be identified, use descriptive names like NARRATOR, SPEAKER 1, HOST, GUEST etc.
- Break the video into logical scenes based on both visual and dialogue cues
- Add detailed action lines describing what is actually visible in the frames
- Maintain the original meaning and content of the transcript
- Keep dialogue natural — clean up filler words (um, uh, like) unless they serve characterization
- Add (V.O.) for voiceover narration, (O.S.) for off-screen dialogue where appropriate
- Note on-screen text, titles, or graphics if visible in the frames

OUTPUT FORMAT:
Return ONLY the formatted screenplay text. No explanations, no markdown code blocks, no commentary. Just the screenplay itself.`;

export async function generateScreenplay(
  transcript: string,
  videoTitle: string,
  durationSeconds: number,
  frames?: FrameData[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  const useVision = frames && frames.length > 0;

  const userPrompt = `Convert the following YouTube video ${useVision ? "content (transcript + visual frames)" : "transcript"} into a properly formatted movie screenplay.

VIDEO CONTEXT:
- Title/Reference: ${videoTitle}
- Duration: ${Math.ceil(durationSeconds / 60)} minute(s) (${durationSeconds} seconds)
${useVision ? `- Visual frames: ${frames.length} frames extracted at regular intervals (timestamps noted below)` : ""}

TRANSCRIPT:
${transcript}

Generate the screenplay now. Remember: output ONLY the formatted screenplay, no explanations or markdown.`;

  // Build content blocks: text prompt + optional image frames
  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  if (useVision) {
    // Interleave frames with timestamp labels for temporal context
    for (const frame of frames) {
      content.push({
        type: "text",
        text: `[Frame at ${formatTimestamp(frame.timestampSeconds)}]`,
      });
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: frame.base64,
        },
      });
    }
  }

  content.push({ type: "text", text: userPrompt });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content,
      },
    ],
    system: useVision ? SCREENPLAY_VISION_SYSTEM_PROMPT : SCREENPLAY_SYSTEM_PROMPT,
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response received from AI");
  }

  return textBlock.text;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
