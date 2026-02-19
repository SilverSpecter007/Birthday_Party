import type { APIRoute } from 'astro';
import { getGuest, updateRsvp } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { guestId, status, plusOneName, dietary, message } = body;

  if (!guestId || !status || !['accepted', 'declined'].includes(status)) {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const guest = await getGuest(guestId);
  if (!guest) {
    return new Response(JSON.stringify({ error: 'Gast nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updated = await updateRsvp(guestId, {
    status,
    plusOneName: status === 'accepted' ? plusOneName : undefined,
    dietary: status === 'accepted' ? dietary : undefined,
    message,
  });

  return new Response(JSON.stringify({ success: true, guest: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
