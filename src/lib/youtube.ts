import { YoutubeTranscript } from "youtube-transcript";

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  durationSeconds: number;
  transcript: TranscriptSegment[];
  fullText: string;
}

const MAX_DURATION_SECONDS = 120; // 2 minutes for MVP

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function getVideoTranscript(url: string): Promise<VideoInfo> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
    lang: "en",
  });

  if (!rawTranscript || rawTranscript.length === 0) {
    throw new Error(
      "No English transcript available for this video. The video must have English captions."
    );
  }

  const transcript: TranscriptSegment[] = rawTranscript.map((segment) => ({
    text: segment.text,
    offset: segment.offset / 1000,
    duration: segment.duration / 1000,
  }));

  const lastSegment = transcript[transcript.length - 1];
  const durationSeconds = Math.ceil(lastSegment.offset + lastSegment.duration);

  if (durationSeconds > MAX_DURATION_SECONDS) {
    throw new Error(
      `Video is ${Math.ceil(durationSeconds / 60)} minutes long. MVP supports videos up to 2 minutes. Please try a shorter video.`
    );
  }

  const fullText = transcript.map((s) => s.text).join(" ");

  // Extract title from video ID (we'll use the transcript context for the AI)
  const title = `YouTube Video ${videoId}`;

  return {
    videoId,
    title,
    durationSeconds,
    transcript,
    fullText,
  };
}
