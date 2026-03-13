import { verifySession } from '../middleware';

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function requireAuth(cookies: { get: (name: string) => { value?: string } | undefined }): Response | null {
  const session = cookies.get('admin_session')?.value;
  if (!session || !verifySession(session)) {
    return jsonResponse({ error: 'Nicht autorisiert.' }, 401);
  }
  return null;
}
