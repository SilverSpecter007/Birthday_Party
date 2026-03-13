import { defineMiddleware } from 'astro:middleware';
import { createHmac } from 'crypto';

const COOKIE_NAME = 'admin_session';
// Use '.' as separator — ':' gets URL-encoded to '%3A' by Astro's cookie
// serialisation, so cookie.split(':') returns 1 part instead of 3 and
// verifySession always fails in browsers.
const SEP = '.';

function getSecret(): string {
  return import.meta.env.ADMIN_PASSWORD || 'default-change-me';
}

export function signSession(timestamp: number): string {
  const data = `admin${SEP}${timestamp}`;
  const signature = createHmac('sha256', getSecret()).update(data).digest('hex').substring(0, 16);
  return `${data}${SEP}${signature}`;
}

export function verifySession(cookie: string): boolean {
  const parts = cookie.split(SEP);
  if (parts.length !== 3) return false;

  const [prefix, timestamp, signature] = parts;
  if (prefix !== 'admin') return false;

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Session expires after 24 hours
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - ts > maxAge) return false;

  const expected = createHmac('sha256', getSecret())
    .update(`${prefix}${SEP}${timestamp}`)
    .digest('hex')
    .substring(0, 16);
  return signature === expected;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = context.cookies.get(COOKIE_NAME)?.value;
    if (!cookie || !verifySession(cookie)) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
