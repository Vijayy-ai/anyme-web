import { cookies } from "next/headers";
import { hashToken, safeEqual } from "@/lib/geo";

const COOKIE = "anyme_admin";

export function expectedAdminToken() {
  const id = process.env.ADMIN_ID || "";
  const password = process.env.ADMIN_PASSWORD || "";
  if (!id || !password) return null;
  return hashToken(`anyme-admin:${id}:${password}`);
}

export function adminCookieName() {
  return COOKIE;
}

export async function isAdminAuthed() {
  const expected = expectedAdminToken();
  if (!expected) return false;
  const jar = await cookies();
  const got = jar.get(COOKIE)?.value;
  if (!got) return false;
  return safeEqual(got, expected);
}
