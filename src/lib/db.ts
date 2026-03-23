import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "screenplayr.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      credits_remaining INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      video_title TEXT,
      duration_seconds INTEGER,
      transcript TEXT,
      screenplay TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      script_id TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (script_id) REFERENCES scripts(id)
    );
  `);
}

export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: "free" | "starter" | "pro" | "unlimited";
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  user_id: string;
  youtube_url: string;
  video_title: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  screenplay: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error: string | null;
  created_at: string;
}

export function getOrCreateUser(email: string): User {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as User | undefined;

  if (existing) return existing;

  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO users (id, email) VALUES (?, ?)"
  ).run(id, email);

  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User;
}

export function getUserByEmail(email: string): User | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as User | undefined;
}

export function decrementCredits(userId: string): boolean {
  const db = getDb();
  const result = db
    .prepare(
      "UPDATE users SET credits_remaining = credits_remaining - 1, updated_at = datetime('now') WHERE id = ? AND credits_remaining > 0"
    )
    .run(userId);
  return result.changes > 0;
}

export function createScript(
  userId: string,
  youtubeUrl: string
): Script {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO scripts (id, user_id, youtube_url) VALUES (?, ?, ?)"
  ).run(id, userId, youtubeUrl);

  return db.prepare("SELECT * FROM scripts WHERE id = ?").get(id) as Script;
}

export function updateScript(
  id: string,
  updates: Partial<Pick<Script, "video_title" | "duration_seconds" | "transcript" | "screenplay" | "status" | "error">>
): void {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return;
  values.push(id);

  db.prepare(`UPDATE scripts SET ${fields.join(", ")} WHERE id = ?`).run(
    ...values
  );
}

export function getScriptsByUser(userId: string): Script[] {
  return getDb()
    .prepare("SELECT * FROM scripts WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Script[];
}

export function getScriptById(id: string): Script | undefined {
  return getDb()
    .prepare("SELECT * FROM scripts WHERE id = ?")
    .get(id) as Script | undefined;
}

export function logUsage(userId: string, scriptId: string, action: string): void {
  getDb()
    .prepare("INSERT INTO usage_logs (user_id, script_id, action) VALUES (?, ?, ?)")
    .run(userId, scriptId, action);
}
