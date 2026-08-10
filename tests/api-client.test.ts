import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createHttpClient, setAccessToken } from "../src/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken("");
});

describe("HTTP client", () => {
  it("注入认证、请求标识和幂等键", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "task-1" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken("test-token");

    const client = createHttpClient({ baseUrl: "https://api.example.com" });
    await client.request("/tasks", { method: "POST", body: { prompt: "hello" }, idempotencyKey: "idem-1" });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/tasks", expect.objectContaining({
      method: "POST",
      credentials: "include",
      headers: expect.objectContaining({ Authorization: "Bearer test-token", "Idempotency-Key": "idem-1" }),
    }));
  });

  it("将后端错误统一转换为 ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "POINTS_NOT_ENOUGH", message: "创作点不足", request_id: "req-1" }), {
      status: 422,
      headers: { "content-type": "application/json" },
    })));

    const client = createHttpClient({ baseUrl: "https://api.example.com" });
    await expect(client.request("/tasks")).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      code: "POINTS_NOT_ENOUGH",
      requestId: "req-1",
      message: "创作点不足",
    });
  });
});
