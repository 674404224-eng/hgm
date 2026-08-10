const DEFAULT_TIMEOUT = 15000;

type ApiErrorOptions = {
  status?: number;
  code?: string;
  requestId?: string;
  details?: unknown;
};

export type RequestOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: TBody;
  timeout?: number;
  idempotencyKey?: string;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  code: string;
  requestId: string;
  details: unknown;

  constructor(message: string, { status = 0, code = "NETWORK_ERROR", requestId = "", details = null }: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

let accessToken = "";

export function setAccessToken(token: string) {
  accessToken = token || "";
}

export function createHttpClient({ baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1", timeout = DEFAULT_TIMEOUT }: { baseUrl?: string; timeout?: number } = {}) {
  const request = async <TResponse, TBody = unknown>(path: string, options: RequestOptions<TBody> = {}): Promise<TResponse> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), options.timeout || timeout);
    const requestId = crypto.randomUUID();
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        credentials: "include",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "X-Request-ID": requestId,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) {
        throw new ApiError(payload?.message || `请求失败（${response.status}）`, {
          status: response.status,
          code: payload?.code || "HTTP_ERROR",
          requestId: payload?.request_id || response.headers.get("x-request-id") || requestId,
          details: payload?.details,
        });
      }
      return payload as TResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") throw new ApiError("请求超时，请稍后重试", { code: "REQUEST_TIMEOUT", requestId });
      throw new ApiError("网络连接失败，请检查服务状态", { code: "NETWORK_ERROR", requestId, details: error instanceof Error ? error.message : String(error) });
    } finally {
      window.clearTimeout(timer);
    }
  };
  return { request };
}
