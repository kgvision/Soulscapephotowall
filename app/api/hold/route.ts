import { NextResponse } from "next/server";
import { toggleHold } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  await toggleHold();
  return NextResponse.json({ ok: true });
}
