import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/guests.db');

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    plus_one INTEGER DEFAULT 0,
    plus_one_name TEXT,
    status TEXT DEFAULT 'pending',
    dietary TEXT,
    message TEXT,
    responded_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  plus_one: number;
  plus_one_name: string | null;
  status: 'pending' | 'accepted' | 'declined';
  dietary: string | null;
  message: string | null;
  responded_at: string | null;
  created_at: string;
}

export function getAllGuests(): Guest[] {
  return db.prepare('SELECT * FROM guests ORDER BY created_at DESC').all() as Guest[];
}

export function getGuest(id: string): Guest | undefined {
  return db.prepare('SELECT * FROM guests WHERE id = ?').get(id) as Guest | undefined;
}

export function createGuest(data: { id: string; name: string; email?: string; plus_one?: number }): Guest {
  const stmt = db.prepare('INSERT INTO guests (id, name, email, plus_one) VALUES (?, ?, ?, ?)');
  stmt.run(data.id, data.name, data.email || null, data.plus_one || 0);
  return getGuest(data.id)!;
}

export function updateGuest(id: string, data: Partial<Pick<Guest, 'name' | 'email' | 'plus_one' | 'status' | 'plus_one_name' | 'dietary' | 'message'>>): Guest | undefined {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.plus_one !== undefined) { fields.push('plus_one = ?'); values.push(data.plus_one); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.plus_one_name !== undefined) { fields.push('plus_one_name = ?'); values.push(data.plus_one_name); }
  if (data.dietary !== undefined) { fields.push('dietary = ?'); values.push(data.dietary); }
  if (data.message !== undefined) { fields.push('message = ?'); values.push(data.message); }

  if (fields.length === 0) return getGuest(id);

  values.push(id);
  db.prepare(`UPDATE guests SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getGuest(id);
}

export function updateRsvp(id: string, data: { status: string; plusOneName?: string; dietary?: string; message?: string }): Guest | undefined {
  const stmt = db.prepare(`
    UPDATE guests
    SET status = ?, plus_one_name = ?, dietary = ?, message = ?, responded_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(data.status, data.plusOneName || null, data.dietary || null, data.message || null, id);
  return getGuest(id);
}

export function deleteGuest(id: string): boolean {
  const result = db.prepare('DELETE FROM guests WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getStats() {
  const total = (db.prepare('SELECT COUNT(*) as count FROM guests').get() as { count: number }).count;
  const accepted = (db.prepare("SELECT COUNT(*) as count FROM guests WHERE status = 'accepted'").get() as { count: number }).count;
  const declined = (db.prepare("SELECT COUNT(*) as count FROM guests WHERE status = 'declined'").get() as { count: number }).count;
  const pending = (db.prepare("SELECT COUNT(*) as count FROM guests WHERE status = 'pending'").get() as { count: number }).count;
  const plusOnes = (db.prepare("SELECT COUNT(*) as count FROM guests WHERE status = 'accepted' AND plus_one = 1 AND plus_one_name IS NOT NULL AND plus_one_name != ''").get() as { count: number }).count;

  return { total, accepted, declined, pending, plusOnes };
}

export function generateGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
}
