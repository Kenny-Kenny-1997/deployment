import { NextRequest } from "next/server";
import { verifyAccessToken, AccessTokenPayload } from "./jwt";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

/**
 * Extracts and verifies the access token from either the httpOnly cookie
 * (browser flow) or the Authorization header (API client / mobile flow).
 * Returns null instead of throwing so callers can return a clean 401.
 */
export function getAuthUser(req: NextRequest): AccessTokenPayload | null {
  const cookieToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const headerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = cookieToken || headerToken;

  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Like getAuthUser but throws, for routes where auth is mandatory.
 * Lets handlers stay flat: const user = requireAuthUser(req)
 */
export function requireAuthUser(req: NextRequest): AccessTokenPayload {
  const user = getAuthUser(req);
  if (!user) throw new UnauthorizedError();
  return user;
}

export function requireRole(
  user: AccessTokenPayload,
  roles: Array<"USER" | "MODERATOR" | "ADMIN">
) {
  if (!roles.includes(user.role)) {
    throw new ForbiddenError(`Requires one of roles: ${roles.join(", ")}`);
  }
}
