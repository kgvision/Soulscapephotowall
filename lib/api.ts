export async function joinShow(code: string, name: string) {
  const res = await fetch("/api/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, name }),
  });
  return res.json() as Promise<{ ok: boolean; error?: string }>;
}

export async function uploadPhoto(params: { code: string; author: string; ownerId: string; blob: Blob }) {
  const form = new FormData();
  form.set("code", params.code);
  form.set("author", params.author);
  form.set("ownerId", params.ownerId);
  form.set("file", params.blob, "photo.jpg");
  try {
    const res = await fetch("/api/photos", { method: "POST", body: form });
    // A server error can come back as an HTML error page rather than our
    // JSON shape (e.g. an unhandled exception) — res.json() would throw and,
    // uncaught, leave the caller's "submitting" state stuck forever.
    const data = await res.json().catch(() => null);
    if (!data) {
      return { ok: false, error: `Upload failed (${res.status}). Check your connection and try again.` };
    }
    return data as { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}

export async function approvePhotoRequest(id: string) {
  return fetch(`/api/photos/${id}/approve`, { method: "POST" }).then((r) => r.json());
}

export async function removePhotoRequest(id: string) {
  return fetch(`/api/photos/${id}/remove`, { method: "POST" }).then((r) => r.json());
}

export async function toggleHoldRequest() {
  return fetch("/api/hold", { method: "POST" }).then((r) => r.json());
}

export async function pushPromptRequest() {
  return fetch("/api/prompt", { method: "POST" }).then((r) => r.json());
}
