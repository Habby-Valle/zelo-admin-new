"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchServiceInvoices,
  fetchServiceInvoiceById,
  updateServiceInvoiceStatus,
  fetchServiceInvoiceStats,
} from "../services";

export function useServiceInvoices(params: { status: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["service-invoices", params.status, params.page, params.pageSize],
    queryFn: () => fetchServiceInvoices(params),
  });
}

export function useServiceInvoice(id: string) {
  return useQuery({
    queryKey: ["service-invoices", id],
    queryFn: () => fetchServiceInvoiceById(id),
    enabled: !!id,
  });
}

export function useUpdateServiceInvoiceStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: "paid" | "cancelled") => updateServiceInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-invoices", id] });
      queryClient.invalidateQueries({ queryKey: ["service-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["service-invoice-stats"] });
    },
  });
}

export function useServiceInvoiceStats() {
  return useQuery({
    queryKey: ["service-invoice-stats"],
    queryFn: fetchServiceInvoiceStats,
  });
}
