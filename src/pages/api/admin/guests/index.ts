import type { APIRoute } from 'astro';
import { createGuest, generateGuestId } from '../../../../lib/db';
import { EVENT } from '../../../../lib/config';
import { jsonResponse, requireAuth } from '../../../../lib/api';

export const POST: APIRoute = async ({ request, cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  const body = await request.json();
  const { name, email, plus_one, invited_by } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return jsonResponse({ error: 'Name ist erforderlich.' }, 400);
  }

  const id = generateGuestId();
  const guest = await createGuest({
    id,
    name: name.trim(),
    email: email?.trim() || undefined,
    plus_one: plus_one ? 1 : 0,
    invited_by: invited_by === 'janina' ? 'janina' : 'julian',
  });

  return jsonResponse({ success: true, guest, link: `${EVENT.base_url}/${guest.id}` }, 201);
};
