import type { APIRoute } from 'astro';
import { getGuest, updateGuest, deleteGuest } from '../../../../lib/db';
import { jsonResponse, requireAuth } from '../../../../lib/api';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  const { id } = params;
  if (!id) return jsonResponse({ error: 'ID fehlt.' }, 400);

  const existing = await getGuest(id);
  if (!existing) return jsonResponse({ error: 'Gast nicht gefunden.' }, 404);

  const body = await request.json();
  const updated = await updateGuest(id, {
    name: body.name,
    email: body.email,
    plus_one: body.plus_one,
    status: body.status,
    invited_by: body.invited_by === 'janina' ? 'janina' : body.invited_by === 'julian' ? 'julian' : undefined,
  });

  return jsonResponse({ success: true, guest: updated });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const authError = requireAuth(cookies);
  if (authError) return authError;

  const { id } = params;
  if (!id) return jsonResponse({ error: 'ID fehlt.' }, 400);

  const deleted = await deleteGuest(id);
  if (!deleted) return jsonResponse({ error: 'Gast nicht gefunden.' }, 404);

  return jsonResponse({ success: true });
};
