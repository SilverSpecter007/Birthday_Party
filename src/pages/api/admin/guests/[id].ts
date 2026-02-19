import type { APIRoute } from 'astro';
import { getGuest, updateGuest, deleteGuest } from '../../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existing = await getGuest(id);
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Gast nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const updated = await updateGuest(id, {
    name: body.name,
    email: body.email,
    plus_one: body.plus_one,
    status: body.status,
  });

  return new Response(JSON.stringify({ success: true, guest: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deleted = await deleteGuest(id);
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
import type { APIRoute } from 'astro';
import { getGuest, updateGuest, deleteGuest } from '../../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existing = await getGuest(id);
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Gast nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const updated = await updateGuest(id, {
    name: body.name,
    email: body.email,
    plus_one: body.plus_one,
    status: body.status,
  });

  return new Response(JSON.stringify({ success: true, guest: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deleted = await deleteGuest(id);
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
