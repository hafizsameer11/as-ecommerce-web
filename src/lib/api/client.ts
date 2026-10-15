export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;

  constructor(status: number, body: ApiErrorBody | null, fallback = "Request failed") {
    const message = body?.error?.message ?? fallback;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error?.code ?? "UNKNOWN";
    this.details = body?.error?.details;
    this.requestId = body?.error?.requestId;
  }
}

const DEFAULT_BASE = "http://localhost:4000";
const TOKEN_KEY = "asl-store-tokens";
const REFRESH_PATH = "/store/auth/refresh";

export type TokenPair = { accessToken: string; refreshToken: string };

let refreshInFlight: Promise<TokenPair | null> | null = null;

export function apiBaseUrl() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || DEFAULT_BASE;
}

export function loadTokens(): TokenPair | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TokenPair;
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: TokenPair | null) {
  if (typeof window === "undefined") return;
  if (!tokens) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, do not send JSON Content-Type (e.g. FormData) */
  rawBody?: BodyInit | null;
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** Skip Authorization header (login/register) */
  skipAuth?: boolean;
  /** Internal: skip 401 refresh retry (prevents loops) */
  _authRetry?: boolean;
};

function shouldAttemptRefresh(status: number, code: string, path: string, authRetry?: boolean) {
  if (authRetry) return false;
  if (status !== 401) return false;
  if (code !== "TOKEN_INVALID" && code !== "UNAUTHENTICATED") return false;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (
    normalized.startsWith(REFRESH_PATH) ||
    normalized.includes("/auth/login") ||
    normalized.includes("/auth/register")
  ) {
    return false;
  }
  return true;
}

async function refreshStoreSession(): Promise<TokenPair | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const current = loadTokens();
    try {
      const url = `${apiBaseUrl()}/api/v1${REFRESH_PATH}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current?.refreshToken ? { refreshToken: current.refreshToken } : {}),
        credentials: "include",
      });
      if (!res.ok) {
        saveTokens(null);
        return null;
      }
      const text = await res.text();
      let json: unknown = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      }
      const data =
        json && typeof json === "object" && json !== null && "data" in json
          ? (json as { data: TokenPair }).data
          : (json as TokenPair);
      if (!data?.accessToken || !data?.refreshToken) {
        saveTokens(null);
        return null;
      }
      saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data;
    } catch {
      saveTokens(null);
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

type ParsedResponse = {
  res: Response;
  json: unknown;
  error: ApiError | null;
};

async function fetchApi(path: string, opts: ApiRequestOptions): Promise<ParsedResponse> {
  const url = `${apiBaseUrl()}/api/v1${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

  if (!opts.skipAuth) {
    const tokens = loadTokens();
    if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  let body: BodyInit | undefined;
  if (opts.rawBody !== undefined) {
    body = opts.rawBody ?? undefined;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, {
    method: opts.method ?? (opts.body !== undefined || opts.rawBody !== undefined ? "POST" : "GET"),
    headers,
    body,
    credentials: "include",
    signal: opts.signal,
  });

  if (res.status === 204) {
    return { res, json: null, error: null };
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const errBody = json as ApiErrorBody | null;
    const error = new ApiError(res.status, errBody, res.statusText || "Request failed");
    return { res, json, error };
  }

  return { res, json, error: null };
}

export async function apiRequest<T>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
  let parsed = await fetchApi(path, opts);

  if (
    parsed.error &&
    shouldAttemptRefresh(parsed.error.status, parsed.error.code, path, opts._authRetry)
  ) {
    const refreshed = await refreshStoreSession();
    if (refreshed?.accessToken) {
      parsed = await fetchApi(path, { ...opts, _authRetry: true });
    }
  }

  if (parsed.error) throw parsed.error;
  if (parsed.res.status === 204) return undefined as T;

  const json = parsed.json;
  if (json && typeof json === "object" && json !== null && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export async function apiRequestWithMeta<T>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  let parsed = await fetchApi(path, opts);

  if (
    parsed.error &&
    shouldAttemptRefresh(parsed.error.status, parsed.error.code, path, opts._authRetry)
  ) {
    const refreshed = await refreshStoreSession();
    if (refreshed?.accessToken) {
      parsed = await fetchApi(path, { ...opts, _authRetry: true });
    }
  }

  if (parsed.error) throw parsed.error;
  if (parsed.res.status === 204) return { data: undefined as T };

  const json = parsed.json;
  if (json && typeof json === "object" && json !== null && "data" in json) {
    const envelope = json as { data: T; meta?: Record<string, unknown> };
    return { data: envelope.data, meta: envelope.meta };
  }
  return { data: json as T };
}

/** Money helpers: API uses integer kobo (₦1 = 100). */
export const koboToNaira = (kobo: number) => kobo / 100;
export const nairaToKobo = (naira: number) => Math.round(naira * 100);
