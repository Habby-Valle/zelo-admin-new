"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchLeads, fetchLead, updateLeadStatusApi } from "@/features/leads/services";
import { createInviteFetch } from "@/features/users/services";
import type { LeadFilters } from "@/features/leads/types";

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadFilters) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

export function useLeads(params: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => fetchLeads(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => fetchLead(id),
    enabled: !!id,
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLeadStatusApi(id, status),
    onSuccess: () => {
      toast.success("Status atualizado.");
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
    onError: () => {
      toast.error("Erro ao atualizar status.");
    },
  });
}

/**
 * Converte um lead em convite de clinic_admin e marca o lead como convertido.
 * O convite dispara o fluxo de registro que cria a clínica.
 */
export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      await createInviteFetch({ email, role: "clinic_admin", clinic_id: null });
      return updateLeadStatusApi(id, "converted");
    },
    onSuccess: () => {
      toast.success("Convite enviado e lead convertido.");
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Erro ao converter lead.";
      toast.error(message);
    },
  });
}
