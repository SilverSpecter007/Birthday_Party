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

export async function createGuest(data: { id: string; name: string; email?: string; plus_one?: number }): Promise<Guest> {
  await db.execute({
    sql: 'INSERT INTO guests (id, name, email, plus_one) VALUES (?, ?, ?, ?)',
    args: [data.id, data.name, data.email || null, data.plus_one || 0],
  });
  return (await getGuest(data.id))!;
}

export async function updateGuest(
  id: string,
  data: Partial<Pick<Guest, 'name' | 'email' | 'plus_one' | 'status' | 'plus_one_name' | 'dietary' | 'message'>>
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
  const [totalR, acceptedR, declinedR, pendingR, plusOnesR] = await Promise.all([
    db.execute('SELECT COUNT(*) as count FROM guests'),
    db.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'accepted'"),
    db.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'declined'"),
    db.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'pending'"),
    db.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'accepted' AND plus_one = 1 AND plus_one_name IS NOT NULL AND plus_one_name != ''"),
  ]);

  return {
    total: Number(totalR.rows[0].count),
    accepted: Number(acceptedR.rows[0].count),
    declined: Number(declinedR.rows[0].count),
    pending: Number(pendingR.rows[0].count),
    plusOnes: Number(plusOnesR.rows[0].count),
  };
}

export function generateGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
}
