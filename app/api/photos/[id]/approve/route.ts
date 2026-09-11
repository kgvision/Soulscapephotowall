import { NextResponse } from "next/server";
import { approvePhoto } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await approvePhoto(id);
  return NextResponse.json({ ok: true });
}
