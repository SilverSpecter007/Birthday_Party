import type { APIRoute } from 'astro';
import { createGuest, generateGuestId } from '../../../../lib/db';
import { EVENT } from '../../../../lib/config';
import { verifySession } from '../../../../middleware';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Auth check
  const session = cookies.get('admin_session')?.value;
  if (!session || !verifySession(session)) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { name, email, plus_one } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Name ist erforderlich.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = generateGuestId();
  const guest = createGuest({
    id,
    name: name.trim(),
    email: email?.trim() || undefined,
    plus_one: plus_one ? 1 : 0,
  });

  return new Response(JSON.stringify({
    success: true,
    guest,
    link: `${EVENT.base_url}/${guest.id}`,
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
