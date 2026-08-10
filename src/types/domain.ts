import type { components } from "./openapi";

export type Account = components["schemas"]["Account"];
export type Wallet = components["schemas"]["Wallet"];
export type Transaction = components["schemas"]["Transaction"];
export type TransactionPage = components["schemas"]["TransactionPage"];
export type Model = components["schemas"]["Model"];
export type ModelList = components["schemas"]["ModelList"];
export type Task = components["schemas"]["Task"];
export type TaskPage = components["schemas"]["TaskPage"];
export type TaskResult = components["schemas"]["TaskResult"];
export type TaskStatus = components["schemas"]["TaskStatus"];
export type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];
export type PresignUploadRequest = components["schemas"]["PresignUploadRequest"];
export type PresignUploadResponse = components["schemas"]["PresignUploadResponse"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type Session = components["schemas"]["Session"];
export type SendSmsCodeRequest = components["schemas"]["SendSmsCodeRequest"];
export type SendSmsCodeResponse = components["schemas"]["SendSmsCodeResponse"];

export type PageRequest = {
  page?: number;
  pageSize?: number;
};

export type TaskListRequest = PageRequest & {
  status?: TaskStatus;
  query?: string;
};

export type AppApi = {
  isMock: boolean;
  auth: {
    sendSmsCode(body: SendSmsCodeRequest): Promise<SendSmsCodeResponse>;
    login(body: LoginRequest): Promise<Session>;
    refresh(): Promise<Session>;
    logout(): Promise<null>;
  };
  account: { get(): Promise<Account> };
  wallet: {
    get(): Promise<Wallet>;
    listTransactions(request?: PageRequest): Promise<TransactionPage>;
  };
  models: { list(): Promise<ModelList> };
  tasks: {
    list(request?: TaskListRequest): Promise<TaskPage>;
    create(body: CreateTaskRequest): Promise<Task>;
    remove(id: string): Promise<null>;
    getResult(id: string): Promise<TaskResult>;
  };
  uploads: { createPresignedUpload(body: PresignUploadRequest): Promise<PresignUploadResponse> };
};
