import type { APIRoute } from 'astro';
import { getGuest, updateGuest, deleteGuest } from '../../../../lib/db';
import { verifySession } from '../../../../middleware';

function checkAuth(cookies: any): Response | null {
  const session = cookies.get('admin_session')?.value;
  if (!session || !verifySession(session)) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const authError = checkAuth(cookies);
  if (authError) return authError;

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const guest = getGuest(id);
  if (!guest) {
    return new Response(JSON.stringify({ error: 'Gast nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const updated = updateGuest(id, {
    name: body.name,
    email: body.email,
    plus_one: body.plus_one ? 1 : 0,
    status: body.status,
  });

  return new Response(JSON.stringify({ success: true, guest: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const authError = checkAuth(cookies);
  if (authError) return authError;

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deleted = deleteGuest(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Gast nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
