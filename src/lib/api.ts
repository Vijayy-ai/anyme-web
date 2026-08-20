import { API_BASE } from "./constants";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (body as { message?: string })?.message ||
      res.statusText ||
      "Request failed";
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

/** Client-side fetch without Next cache tags */
export async function apiGetClient<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (body as { message?: string })?.message ||
      res.statusText ||
      "Request failed";
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}
