import { NextResponse } from "next/server";
import { validateCode } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!validateCode(code)) {
    return NextResponse.json({ ok: false, error: "That code doesn't match. Check the entrance monitor." }, { status: 400 });
  }
  if (!name || name.length > 24) {
    return NextResponse.json({ ok: false, error: "Enter your first name (up to 24 characters)." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
