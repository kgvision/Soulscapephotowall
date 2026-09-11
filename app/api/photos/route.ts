import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { addPhoto, validateCode } from "@/lib/store";

export const runtime = "nodejs";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Runs once per cold instance start — check Vercel's Runtime Logs for this
// line to confirm a deploy actually picked up BLOB_READ_WRITE_TOKEN rather
// than silently trying (and failing) to write to the read-only filesystem.
if (hasBlobToken) {
  console.log("[photos] using Vercel Blob for storage");
} else {
  console.warn(
    "[photos] no BLOB_READ_WRITE_TOKEN found — falling back to local disk, which will fail on a " +
      "deployed Vercel serverless function: connect a Blob store in the Vercel dashboard's Storage tab.",
  );
}

async function storePhoto(filename: string, bytes: Buffer, contentType: string): Promise<string> {
  if (hasBlobToken) {
    const blob = await put(filename, bytes, { access: "public", contentType, addRandomSuffix: false });
    return blob.url;
  }
  // Local-dev fallback only — a deployed Vercel serverless function's
  // filesystem is read-only outside of /tmp, so this path never runs in
  // production once a Blob store is connected.
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

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

  // Every failure path below returns our own JSON error shape rather than
  // letting an exception surface as a generic HTML 500 — an unhandled
  // rejection there used to leave the client's "SENDING..." state stuck
  // forever (res.json() throwing on a non-JSON body, uncaught).
  try {
    const id = nanoid(12);
    const filename = `${id}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const imageUrl = await storePhoto(filename, bytes, file.type);
    const photo = await addPhoto({ author, imageUrl, ownerId });
    return NextResponse.json({ ok: true, photo });
  } catch (err) {
    console.error("photo upload failed", err);
    return NextResponse.json({ ok: false, error: "Couldn't save that photo — try again." }, { status: 500 });
  }
}
