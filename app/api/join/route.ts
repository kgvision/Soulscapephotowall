import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name || name.length > 24) {
    return NextResponse.json({ ok: false, error: "Enter your first name (up to 24 characters)." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
