import { createHttpClient, setAccessToken } from "./client";
import { createMockApi } from "./mock";
import type {
  Account,
  AppApi,
  CreateTaskRequest,
  LoginRequest,
  ModelList,
  PresignUploadRequest,
  PresignUploadResponse,
  SendSmsCodeRequest,
  SendSmsCodeResponse,
  Session,
  Task,
  TaskPage,
  TaskResult,
  TransactionPage,
  Wallet,
} from "../types/domain";

function createHttpApi(): AppApi {
  const client = createHttpClient();
  const query = (params: Record<string, string | number | undefined> = {}) => {
    const value = new URLSearchParams(
      Object.entries(params)
        .filter(([, item]) => item !== undefined && item !== "")
        .map(([key, item]) => [key, String(item)]),
    );
    return value.size ? `?${value}` : "";
  };
  return {
    isMock: false,
    auth: {
      sendSmsCode: (body: SendSmsCodeRequest) => client.request<SendSmsCodeResponse, SendSmsCodeRequest>("/auth/sms-codes", { method: "POST", body }),
      async login(body: LoginRequest) { const session = await client.request<Session, LoginRequest>("/auth/sessions", { method: "POST", body }); setAccessToken(session.access_token); return session; },
      async refresh() { const session = await client.request<Session>("/auth/sessions/refresh", { method: "POST" }); setAccessToken(session.access_token); return session; },
      async logout() { await client.request<null>("/auth/session", { method: "DELETE" }); setAccessToken(""); return null; },
    },
    account: { get: () => client.request<Account>("/me") },
    wallet: {
      get: () => client.request<Wallet>("/wallet"),
      listTransactions: ({ page = 1, pageSize = 20 } = {}) => client.request<TransactionPage>(`/wallet/transactions${query({ page, page_size: pageSize })}`),
    },
    models: { list: () => client.request<ModelList>("/models") },
    tasks: {
      list: ({ page = 1, pageSize = 20, status, query: search } = {}) => client.request<TaskPage>(`/tasks${query({ page, page_size: pageSize, status, q: search })}`),
      create: (body: CreateTaskRequest) => client.request<Task, CreateTaskRequest>("/tasks", { method: "POST", body, idempotencyKey: crypto.randomUUID() }),
      async remove(id: string) { await client.request<null>(`/tasks/${id}`, { method: "DELETE" }); return null; },
      getResult: (id: string) => client.request<TaskResult>(`/tasks/${id}/result`),
    },
    uploads: { createPresignedUpload: (body: PresignUploadRequest) => client.request<PresignUploadResponse, PresignUploadRequest>("/uploads/presign", { method: "POST", body }) },
  };
}

export const api: AppApi = (import.meta.env.VITE_API_MODE || "mock") === "http" ? createHttpApi() : createMockApi();
