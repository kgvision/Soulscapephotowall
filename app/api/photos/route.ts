import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { addPhoto, validateCode } from "@/lib/store";

export const runtime = "nodejs";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Bad upload." }, { status: 400 });
  }

  const code = String(form.get("code") ?? "");
  const author = String(form.get("author") ?? "").trim();
  const ownerId = String(form.get("ownerId") ?? "").trim();
  const file = form.get("file");

  if (!validateCode(code)) {
    return NextResponse.json({ ok: false, error: "Invalid show code." }, { status: 400 });
  }
  if (!author || author.length > 24) {
    return NextResponse.json({ ok: false, error: "Missing name." }, { status: 400 });
  }
  if (!ownerId) {
    return NextResponse.json({ ok: false, error: "Missing device id." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing photo." }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Unsupported image type." }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "Photo is too large." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const id = nanoid(12);
  const filename = `${id}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  const photo = addPhoto({ author, imageUrl: `/uploads/${filename}`, ownerId });
  return NextResponse.json({ ok: true, photo });
}
