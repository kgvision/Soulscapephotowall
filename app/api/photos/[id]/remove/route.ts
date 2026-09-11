import { NextResponse } from "next/server";
import { removePhoto } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await removePhoto(id);
  return NextResponse.json({ ok: true });
}
