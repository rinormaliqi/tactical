import { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'mali_admin';

/** The password the owner uses to log in. Override via ADMIN_PASSWORD in .env.local */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mali2025';

/**
 * Opaque session token stored in the httpOnly cookie. Server-only — never sent to
 * the client bundle. Override via ADMIN_SESSION_SECRET in .env.local.
 */
export const SESSION_VALUE =
  process.env.ADMIN_SESSION_SECRET || 'mali-tactical-default-session-secret';

/** True when the request carries a valid admin session cookie. */
export function isAuthed(req: NextRequest): boolean {
  return req.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
