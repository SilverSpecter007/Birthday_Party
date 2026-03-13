import { createClient } from '@libsql/client';

const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL || 'file:data/guests.db',
  authToken: import.meta.env.TURSO_AUTH_TOKEN || undefined,
});

// Initialize table
await db.execute(`
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
    created_at TEXT DEFAULT (datetime('now')),
    invited_by TEXT DEFAULT 'julian'
  )
`);

// Migration: add invited_by to existing tables
try {
  await db.execute(`ALTER TABLE guests ADD COLUMN invited_by TEXT DEFAULT 'julian'`);
} catch {
  // Column already exists — ignore
}

// Settings table (key/value store for editable content)
await db.execute(`
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
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
  invited_by: 'julian' | 'janina';
}

function rowToGuest(row: Record<string, unknown>): Guest {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) || null,
    plus_one: Number(row.plus_one) || 0,
    plus_one_name: (row.plus_one_name as string) || null,
    status: (row.status as Guest['status']) || 'pending',
    dietary: (row.dietary as string) || null,
    message: (row.message as string) || null,
    responded_at: (row.responded_at as string) || null,
    created_at: row.created_at as string,
    invited_by: ((row.invited_by as string) === 'janina' ? 'janina' : 'julian'),
  };
}

export async function getAllGuests(): Promise<Guest[]> {
  const result = await db.execute('SELECT * FROM guests ORDER BY created_at DESC');
  return result.rows.map((row) => rowToGuest(row as unknown as Record<string, unknown>));
}

export async function getGuest(id: string): Promise<Guest | undefined> {
  const result = await db.execute({ sql: 'SELECT * FROM guests WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return undefined;
  return rowToGuest(result.rows[0] as unknown as Record<string, unknown>);
}

export async function createGuest(data: { id: string; name: string; email?: string; plus_one?: number; invited_by?: string }): Promise<Guest> {
  await db.execute({
    sql: 'INSERT INTO guests (id, name, email, plus_one, invited_by) VALUES (?, ?, ?, ?, ?)',
    args: [data.id, data.name, data.email || null, data.plus_one || 0, data.invited_by || 'julian'],
  });
  return (await getGuest(data.id))!;
}

export async function updateGuest(
  id: string,
  data: Partial<Pick<Guest, 'name' | 'email' | 'plus_one' | 'status' | 'plus_one_name' | 'dietary' | 'message' | 'invited_by'>>
): Promise<Guest | undefined> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.plus_one !== undefined) { fields.push('plus_one = ?'); values.push(data.plus_one); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.plus_one_name !== undefined) { fields.push('plus_one_name = ?'); values.push(data.plus_one_name); }
  if (data.dietary !== undefined) { fields.push('dietary = ?'); values.push(data.dietary); }
  if (data.message !== undefined) { fields.push('message = ?'); values.push(data.message); }
  if (data.invited_by !== undefined) { fields.push('invited_by = ?'); values.push(data.invited_by); }

  if (fields.length === 0) return getGuest(id);

  values.push(id);
  await db.execute({ sql: `UPDATE guests SET ${fields.join(', ')} WHERE id = ?`, args: values });
  return getGuest(id);
}

export async function updateRsvp(
  id: string,
  data: { status: string; plusOneName?: string; dietary?: string; message?: string }
): Promise<Guest | undefined> {
  await db.execute({
    sql: `UPDATE guests SET status = ?, plus_one_name = ?, dietary = ?, message = ?, responded_at = datetime('now') WHERE id = ?`,
    args: [data.status, data.plusOneName || null, data.dietary || null, data.message || null, id],
  });
  return getGuest(id);
}

export async function deleteGuest(id: string): Promise<boolean> {
  const result = await db.execute({ sql: 'DELETE FROM guests WHERE id = ?', args: [id] });
  return result.rowsAffected > 0;
}

export async function getStats() {
  const result = await db.execute(`
    SELECT
      COUNT(*)                                                              AS total,
      COUNT(CASE WHEN status = 'accepted' THEN 1 END)                      AS accepted,
      COUNT(CASE WHEN status = 'declined' THEN 1 END)                      AS declined,
      COUNT(CASE WHEN status = 'pending'  THEN 1 END)                      AS pending,
      COUNT(CASE WHEN status = 'accepted' AND plus_one = 1
                      AND plus_one_name IS NOT NULL
                      AND plus_one_name != '' THEN 1 END)                  AS plus_ones
    FROM guests
  `);
  const row = result.rows[0];
  return {
    total:    Number(row.total),
    accepted: Number(row.accepted),
    declined: Number(row.declined),
    pending:  Number(row.pending),
    plusOnes: Number(row.plus_ones),
  };
}

export async function getInfoContent(): Promise<string> {
  const result = await db.execute({
    sql: "SELECT value FROM settings WHERE key = 'info_content'",
    args: [],
  });
  return result.rows.length > 0 ? ((result.rows[0].value as string) || '') : '';
}

export async function updateInfoContent(content: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES ('info_content', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [content],
  });
}

export function generateGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
}
