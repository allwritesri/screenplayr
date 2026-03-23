import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, createScript, updateScript, decrementCredits, logUsage } from "@/lib/db";
import { getVideoTranscript } from "@/lib/youtube";
import { generateScreenplay } from "@/lib/screenplay";
import { extractVideoFrames, FrameData } from "@/lib/video";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl, email } = body;

    if (!youtubeUrl || !email) {
      return NextResponse.json(
        { error: "YouTube URL and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = getOrCreateUser(email);

    // Check credits
    if (user.credits_remaining <= 0) {
      return NextResponse.json(
        {
          error: "No credits remaining. Please upgrade your plan.",
          code: "NO_CREDITS",
        },
        { status: 403 }
      );
    }

    // Create script record
    const script = createScript(user.id, youtubeUrl);

    try {
      // Extract transcript
      updateScript(script.id, { status: "processing" });
      const videoInfo = await getVideoTranscript(youtubeUrl);

      updateScript(script.id, {
        video_title: videoInfo.title,
        duration_seconds: videoInfo.durationSeconds,
        transcript: videoInfo.fullText,
      });

      // Extract video frames for visual analysis
      let frames: FrameData[] = [];
      try {
        const extraction = await extractVideoFrames(
          videoInfo.videoId,
          videoInfo.durationSeconds
        );
        frames = extraction.frames;
        // Schedule cleanup of temp files (non-blocking)
        extraction.cleanup().catch(() => {});
      } catch (frameErr) {
        // Video analysis is best-effort — fall back to transcript-only
        console.warn(
          "Video frame extraction failed, falling back to transcript-only:",
          frameErr instanceof Error ? frameErr.message : frameErr
        );
      }

      // Generate screenplay (with frames if available, transcript-only otherwise)
      const screenplay = await generateScreenplay(
        videoInfo.fullText,
        videoInfo.title,
        videoInfo.durationSeconds,
        frames
      );

      // Deduct credit
      const credited = decrementCredits(user.id);
      if (!credited) {
        updateScript(script.id, {
          status: "failed",
          error: "Failed to deduct credits",
        });
        return NextResponse.json(
          { error: "Failed to process credits" },
          { status: 500 }
        );
      }

      // Save result
      updateScript(script.id, {
        screenplay,
        status: "completed",
      });

      logUsage(user.id, script.id, "convert");

      return NextResponse.json({
        id: script.id,
        screenplay,
        videoTitle: videoInfo.title,
        durationSeconds: videoInfo.durationSeconds,
        creditsRemaining: user.credits_remaining - 1,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      updateScript(script.id, { status: "failed", error: errorMessage });
      return NextResponse.json({ error: errorMessage }, { status: 422 });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
