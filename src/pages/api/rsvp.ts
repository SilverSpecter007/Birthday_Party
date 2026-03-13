import type { APIRoute } from 'astro';
import { getGuest, updateRsvp } from '../../lib/db';
import { jsonResponse } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { guestId, status, plusOneName, dietary, message } = body;

  if (!guestId || !status || !['accepted', 'declined'].includes(status)) {
    return jsonResponse({ error: 'Ungültige Anfrage.' }, 400);
  }

  const guest = await getGuest(guestId);
  if (!guest) return jsonResponse({ error: 'Gast nicht gefunden.' }, 404);

  const updated = await updateRsvp(guestId, {
    status,
    plusOneName: status === 'accepted' ? plusOneName : undefined,
    dietary: status === 'accepted' ? dietary : undefined,
    message,
  });

  return jsonResponse({ success: true, guest: updated });
};
