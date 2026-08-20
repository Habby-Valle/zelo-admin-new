"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteKeys } from "@/lib/query-keys";
import {
  fetchInvites,
  createInviteFetch,
  cancelInviteFetch,
  deleteInviteFetch,
} from "@/features/users/services";

export function useInvites(params?: {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: inviteKeys.list(params ?? {}),
    queryFn: () => fetchInvites(params),
  });
}

export function useSendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; role: string; clinic_id?: string | null }) =>
      createInviteFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelInviteFetch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}

/**
 * Apaga o convite de vez. Diferente de cancelar, que mantém a linha com
 * status `cancelled` para dar rastro na listagem.
 */
export function useDeleteInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInviteFetch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}
