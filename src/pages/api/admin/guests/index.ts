import type { APIRoute } from 'astro';
import { createGuest, generateGuestId } from '../../../../lib/db';
import { EVENT } from '../../../../lib/config';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { name, email, plus_one } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: 'Name ist erforderlich.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = generateGuestId();
  const guest = await createGuest({ id, name, email, plus_one: plus_one || 0 });
  const link = `${EVENT.base_url}/${guest.id}`;

  return new Response(JSON.stringify({ success: true, guest, link }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
