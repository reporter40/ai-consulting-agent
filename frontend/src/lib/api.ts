/**
 * Browser-side fetch to same-origin `/api` (Next rewrites → FastAPI).
 */

export class ApiError extends Error {
  public readonly code?: string;

  constructor(
    message: string,
    public readonly status: number,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const hasBody =
    init?.body != null &&
    !(typeof init.body === "string" && init.body.length === 0);
  const headers = new Headers(init?.headers);
  if (method === "GET" || method === "HEAD" || !hasBody) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    let message = res.statusText || "Request failed";
    let code: string | undefined;
    const text = await res.text();
    if (text) {
      try {
        const parsed = JSON.parse(text) as {
          detail?: unknown;
          error?: { code?: unknown; message?: unknown };
        };
        if (typeof parsed.error?.message === "string") {
          message = parsed.error.message;
        } else if (typeof parsed.detail === "string") {
          message = parsed.detail;
        } else {
          message = text;
        }
        if (typeof parsed.error?.code === "string") {
          code = parsed.error.code;
        }
      } catch {
        message = text;
      }
    }
    throw new ApiError(message, res.status, code);
  }
  return res.json() as Promise<T>;
}
