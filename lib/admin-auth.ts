import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const DEFAULT_PLACEHOLDER = "default_admin_secret_key_change_me";

/**
 * Resolve the Admin JWT secret key.
 * Enforces strong secret requirements and strictly forbids default/empty secrets in production.
 */
export function getAdminJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === DEFAULT_PLACEHOLDER || secret.length < 32)) {
    throw new Error(
      "[CRITICAL SECURITY ERROR] ADMIN_JWT_SECRET is missing, insecure, or shorter than 32 characters in production."
    );
  }
  return new TextEncoder().encode(secret || DEFAULT_PLACEHOLDER);
}

export async function signAdminToken(payload: { id: string; email: string; role: string }) {
  const secretKey = getAdminJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifyAdminToken(token: string) {
  try {
    const secretKey = getAdminJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  return await verifyAdminToken(token);
}

export async function setAdminSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function removeAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}
