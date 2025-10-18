import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

let db: Database | null = null;

function getDbPath(): string {
  const envPath = process.env.DB_PATH;
  if (envPath && envPath.trim().length > 0) return envPath;
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, 'cloner.db');
}

export function initDb(): void {
  if (db) return;
  const dbPath = getDbPath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      source_guild_id TEXT,
      dest_guild_id TEXT,
      backup_id TEXT,
      channel_count INTEGER,
      error_count INTEGER,
      status TEXT,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER,
      to_email TEXT,
      subject TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      success INTEGER,
      error TEXT,
      FOREIGN KEY(run_id) REFERENCES runs(id)
    );
  `);
}

function requireDb(): Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function createRun(data: {
  source_guild_id?: string;
  dest_guild_id?: string;
  notes?: string;
}): number {
  const db = requireDb();
  const stmt = db.prepare(
    'INSERT INTO runs (source_guild_id, dest_guild_id, status, notes, error_count, channel_count) VALUES (?, ?, ?, ?, 0, 0)'
  );
  const info = stmt.run(data.source_guild_id ?? null, data.dest_guild_id ?? null, 'started', data.notes ?? null);
  return Number(info.lastInsertRowid);
}

export function updateRun(runId: number, data: Partial<{
  source_guild_id: string;
  dest_guild_id: string;
  backup_id: string;
  channel_count: number;
  error_count: number;
  status: string;
  notes: string;
}>): void {
  const db = requireDb();
  const keys = Object.keys(data) as (keyof typeof data)[];
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${String(k)} = ?`).join(', ');
  const values = keys.map((k) => (data as any)[k]);
  const stmt = db.prepare(`UPDATE runs SET ${sets} WHERE id = ?`);
  stmt.run(...values, runId);
}

export function finishRun(runId: number, data: Partial<{
  channel_count: number;
  error_count: number;
  status: string;
  notes: string;
}>): void {
  const db = requireDb();
  const sets: string[] = ['ended_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  if (data.channel_count !== undefined) { sets.push('channel_count = ?'); values.push(data.channel_count); }
  if (data.error_count !== undefined) { sets.push('error_count = ?'); values.push(data.error_count); }
  if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
  if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
  const stmt = db.prepare(`UPDATE runs SET ${sets.join(', ')} WHERE id = ?`);
  stmt.run(...values, runId);
}

export function recordEmail(runId: number, data: { to: string; subject: string; success: boolean; error?: string; }): void {
  const db = requireDb();
  const stmt = db.prepare('INSERT INTO emails (run_id, to_email, subject, success, error) VALUES (?, ?, ?, ?, ?)');
  stmt.run(runId, data.to, data.subject, data.success ? 1 : 0, data.error ?? null);
}
