import { NextResponse } from "next/server";
import { pushNextPrompt } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  await pushNextPrompt();
  return NextResponse.json({ ok: true });
}
