import { createClient, type Client, type InValue } from '@libsql/client';

let db: Client;

function getDb(): Client {
  if (!db) {
    db = createClient({
      url: import.meta.env.TURSO_DATABASE_URL || 'file:data/guests.db',
      authToken: import.meta.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return db;
}

let initialized = false;

async function initDb(): Promise<Client> {
  const client = getDb();
  if (!initialized) {
    await client.execute(`
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
    initialized = true;
  }
  return client;
}

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

export async function getAllGuests(): Promise<Guest[]> {
  const client = await initDb();
  const result = await client.execute('SELECT * FROM guests ORDER BY created_at DESC');
  return result.rows as unknown as Guest[];
}

export async function getGuest(id: string): Promise<Guest | undefined> {
  const client = await initDb();
  const result = await client.execute({ sql: 'SELECT * FROM guests WHERE id = ?', args: [id] });
  return result.rows[0] as unknown as Guest | undefined;
}

export async function createGuest(data: { id: string; name: string; email?: string; plus_one?: number }): Promise<Guest> {
  const client = await initDb();
  await client.execute({
    sql: 'INSERT INTO guests (id, name, email, plus_one) VALUES (?, ?, ?, ?)',
    args: [data.id, data.name, data.email || null, data.plus_one || 0],
  });
  return (await getGuest(data.id))!;
}

export async function updateGuest(id: string, data: Partial<Pick<Guest, 'name' | 'email' | 'plus_one' | 'status' | 'plus_one_name' | 'dietary' | 'message'>>): Promise<Guest | undefined> {
  const fields: string[] = [];
  const values: InValue[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.plus_one !== undefined) { fields.push('plus_one = ?'); values.push(data.plus_one); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.plus_one_name !== undefined) { fields.push('plus_one_name = ?'); values.push(data.plus_one_name); }
  if (data.dietary !== undefined) { fields.push('dietary = ?'); values.push(data.dietary); }
  if (data.message !== undefined) { fields.push('message = ?'); values.push(data.message); }

  if (fields.length === 0) return getGuest(id);

  const client = await initDb();
  values.push(id);
  await client.execute({
    sql: `UPDATE guests SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });
  return getGuest(id);
}

export async function updateRsvp(id: string, data: { status: string; plusOneName?: string; dietary?: string; message?: string }): Promise<Guest | undefined> {
  const client = await initDb();
  await client.execute({
    sql: `UPDATE guests SET status = ?, plus_one_name = ?, dietary = ?, message = ?, responded_at = datetime('now') WHERE id = ?`,
    args: [data.status, data.plusOneName || null, data.dietary || null, data.message || null, id],
  });
  return getGuest(id);
}

export async function deleteGuest(id: string): Promise<boolean> {
  const client = await initDb();
  const result = await client.execute({ sql: 'DELETE FROM guests WHERE id = ?', args: [id] });
  return result.rowsAffected > 0;
}

export async function getStats() {
  const client = await initDb();
  const [total, accepted, declined, pending, plusOnes] = await Promise.all([
    client.execute('SELECT COUNT(*) as count FROM guests'),
    client.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'accepted'"),
    client.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'declined'"),
    client.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'pending'"),
    client.execute("SELECT COUNT(*) as count FROM guests WHERE status = 'accepted' AND plus_one = 1 AND plus_one_name IS NOT NULL AND plus_one_name != ''"),
  ]);

  return {
    total: Number(total.rows[0]!.count),
    accepted: Number(accepted.rows[0]!.count),
    declined: Number(declined.rows[0]!.count),
    pending: Number(pending.rows[0]!.count),
    plusOnes: Number(plusOnes.rows[0]!.count),
  };
}

export function generateGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
}
