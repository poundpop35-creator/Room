// Routes every data call either to the local Next.js API routes (SQLite,
// `npm run dev` / `npm run start`) or to a Google Apps Script Web App
// (Google Sheets backend, used for the static GitHub Pages build) — whichever
// is configured. Call sites use it exactly like `fetch()`, so no component
// needs to know which backend is active.
//
// Set NEXT_PUBLIC_API_BASE_URL to an Apps Script /exec URL to switch to the
// Sheets backend; leave it unset to keep using the local Next API routes.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ParsedPath {
  resource: string;
  id?: string;
  organization?: string;
}

function parsePath(url: string): ParsedPath {
  const [pathPart, queryPart] = url.split("?");
  const segments = pathPart.replace(/^\/api\//, "").split("/").filter(Boolean);
  const params = new URLSearchParams(queryPart ?? "");
  return {
    resource: segments[0],
    id: segments[1],
    organization: params.get("organization") ?? undefined,
  };
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!API_BASE) {
    return fetch(url, init);
  }

  const { resource, id, organization } = parsePath(url);
  const method = (init?.method ?? "GET").toUpperCase();

  if (method === "GET") {
    const qs = new URLSearchParams({ resource });
    if (organization) qs.set("organization", organization);
    if (id) qs.set("id", id);
    return fetch(`${API_BASE}?${qs.toString()}`);
  }

  const action = method === "POST" ? "create" : method === "PUT" ? "update" : "delete";
  const bodyFields = init?.body ? JSON.parse(init.body as string) : {};
  const payload = { resource, id, action, ...bodyFields };

  // text/plain keeps this a CORS "simple request" so the browser skips the
  // preflight OPTIONS request — Apps Script Web Apps don't handle OPTIONS.
  return fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}
