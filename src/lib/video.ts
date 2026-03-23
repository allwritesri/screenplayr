import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

const FRAME_INTERVAL_SECONDS = 3; // Extract one frame every 3 seconds
const MAX_FRAMES = 40; // Cap to control API costs

export interface ExtractedFrames {
  frames: FrameData[];
  cleanup: () => Promise<void>;
}

export interface FrameData {
  base64: string;
  timestampSeconds: number;
}

/**
 * Downloads a YouTube video and extracts key frames at regular intervals.
 * Returns base64-encoded JPEG frames with their timestamps.
 */
export async function extractVideoFrames(
  videoId: string,
  durationSeconds: number
): Promise<ExtractedFrames> {
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "screenplayr-")
  );
  const videoPath = path.join(tmpDir, "video.mp4");
  const framePattern = path.join(tmpDir, "frame-%04d.jpg");

  try {
    // Download video using yt-dlp (worst quality is fine — we just need frames)
    await execFileAsync(
      "yt-dlp",
      [
        "-f", "worst[ext=mp4]/worst",
        "--no-playlist",
        "-o", videoPath,
        `https://www.youtube.com/watch?v=${videoId}`,
      ],
      { timeout: 60_000 }
    );

    // Calculate frame interval — adjust if video is very short
    const interval = Math.max(
      1,
      Math.min(FRAME_INTERVAL_SECONDS, Math.floor(durationSeconds / MAX_FRAMES))
    );

    // Extract frames using ffmpeg
    await execFileAsync(
      "ffmpeg",
      [
        "-i", videoPath,
        "-vf", `fps=1/${interval},scale=512:-1`,
        "-q:v", "8", // Lower quality JPEG to reduce size
        "-frames:v", String(MAX_FRAMES),
        framePattern,
      ],
      { timeout: 60_000 }
    );

    // Read extracted frames
    const files = (await fs.promises.readdir(tmpDir))
      .filter((f) => f.startsWith("frame-") && f.endsWith(".jpg"))
      .sort();

    const frames: FrameData[] = await Promise.all(
      files.map(async (file, index) => {
        const filePath = path.join(tmpDir, file);
        const buffer = await fs.promises.readFile(filePath);
        return {
          base64: buffer.toString("base64"),
          timestampSeconds: index * interval,
        };
      })
    );

    const cleanup = async () => {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    };

    return { frames, cleanup };
  } catch (error) {
    // Clean up on failure
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
    throw error;
  }
}
