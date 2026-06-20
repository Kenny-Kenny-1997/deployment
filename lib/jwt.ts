import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables"
  );
}

export type AccessTokenPayload = {
  sub: string; // user id
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
};

export type RefreshTokenPayload = {
  sub: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}
