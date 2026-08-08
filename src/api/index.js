import { createHttpClient, setAccessToken } from "./client";
import { createMockApi } from "./mock";

function createHttpApi() {
  const client = createHttpClient();
  const query = (params = {}) => {
    const value = new URLSearchParams(Object.entries(params).filter(([, item]) => item !== undefined && item !== ""));
    return value.size ? `?${value}` : "";
  };
  return {
    isMock: false,
    auth: {
      sendSmsCode: (body) => client.request("/auth/sms-codes", { method: "POST", body }),
      async login(body) { const session = await client.request("/auth/sessions", { method: "POST", body }); setAccessToken(session.access_token); return session; },
      async refresh() { const session = await client.request("/auth/sessions/refresh", { method: "POST" }); setAccessToken(session.access_token); return session; },
      async logout() { const result = await client.request("/auth/session", { method: "DELETE" }); setAccessToken(""); return result; },
    },
    account: { get: () => client.request("/me") },
    wallet: {
      get: () => client.request("/wallet"),
      listTransactions: ({ page = 1, pageSize = 20 } = {}) => client.request(`/wallet/transactions${query({ page, page_size: pageSize })}`),
    },
    providers: {
      list: () => client.request("/providers"),
      create: (body) => client.request("/providers", { method: "POST", body }),
      update: (id, body) => client.request(`/providers/${id}`, { method: "PATCH", body }),
      remove: (id) => client.request(`/providers/${id}`, { method: "DELETE" }),
      verify: (id) => client.request(`/providers/${id}/verify`, { method: "POST" }),
    },
    tasks: {
      list: ({ page = 1, pageSize = 20, status, query: search } = {}) => client.request(`/tasks${query({ page, page_size: pageSize, status, q: search })}`),
      create: (body) => client.request("/tasks", { method: "POST", body, idempotencyKey: crypto.randomUUID() }),
      remove: (id) => client.request(`/tasks/${id}`, { method: "DELETE" }),
      getResult: (id) => client.request(`/tasks/${id}/result`),
    },
    uploads: { createPresignedUpload: (body) => client.request("/uploads/presign", { method: "POST", body }) },
  };
}

export const api = (import.meta.env.VITE_API_MODE || "mock") === "http" ? createHttpApi() : createMockApi();
