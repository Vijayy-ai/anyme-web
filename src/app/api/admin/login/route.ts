import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  expectedAdminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const adminId = process.env.ADMIN_ID;
  const password = process.env.ADMIN_PASSWORD;
  if (!adminId || !password) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_ID / ADMIN_PASSWORD not set" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    password?: string;
  };

  const idOk = typeof body.id === "string" && body.id.trim() === adminId;
  const passOk =
    typeof body.password === "string" && body.password === password;

  if (!idOk || !passOk) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const token = expectedAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), token!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
