import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from ".";
import type { CreateTaskRequest, LoginRequest } from "../types/domain";
import { queryKeys } from "./queryKeys";

export function useAccountQuery(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.account, queryFn: api.account.get, enabled, staleTime: 60_000 });
}

export function useWalletQuery(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.wallet, queryFn: api.wallet.get, enabled, staleTime: 15_000 });
}

export function useTransactionsQuery(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.transactions, queryFn: () => api.wallet.listTransactions({ pageSize: 100 }), enabled, staleTime: 30_000 });
}

export function useModelsQuery(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.models, queryFn: api.models.list, enabled, staleTime: 5 * 60_000 });
}

export function useTasksQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => api.tasks.list({ pageSize: 100 }),
    enabled,
    refetchInterval: enabled ? 4_000 : false,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskRequest) => api.tasks.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => api.auth.login(body),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
