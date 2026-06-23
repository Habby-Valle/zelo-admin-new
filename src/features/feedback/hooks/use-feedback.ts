"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeedbacks,
  fetchFeedback,
  updateFeedbackStatusApi,
  softDeleteFeedbackApi,
} from "@/features/feedback/services";
import type { FeedbackFilters } from "@/features/feedback/types";
import { toast } from "sonner";

export const feedbackKeys = {
  all: ["feedbacks"] as const,
  lists: () => [...feedbackKeys.all, "list"] as const,
  list: (params: FeedbackFilters) => [...feedbackKeys.lists(), params] as const,
  details: () => [...feedbackKeys.all, "detail"] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
};

export function useFeedbacks(params: FeedbackFilters) {
  return useQuery({
    queryKey: feedbackKeys.list(params),
    queryFn: () => fetchFeedbacks(params),
  });
}

export function useFeedback(id: string) {
  return useQuery({
    queryKey: feedbackKeys.detail(id),
    queryFn: () => fetchFeedback(id),
    enabled: !!id,
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFeedbackStatusApi(id, status),
    onSuccess: () => {
      toast.success("Status atualizado.");
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
    onError: () => {
      toast.error("Erro ao atualizar status.");
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => softDeleteFeedbackApi(id),
    onSuccess: () => {
      toast.success("Feedback removido.");
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
    onError: () => {
      toast.error("Erro ao remover feedback.");
    },
  });
}
