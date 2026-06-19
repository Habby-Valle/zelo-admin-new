"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInvoices, fetchPayments, fetchPaymentStats } from "@/features/payments/services";

export function useInvoices(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => fetchInvoices(params),
    staleTime: 60 * 1000,
  });
}

export function usePayments(params?: {
  status?: string;
  search?: string;
  clinic_id?: number;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => fetchPayments(params),
    staleTime: 60 * 1000,
  });
}

export function usePaymentStats(clinicId?: number) {
  return useQuery({
    queryKey: ["payment-stats", clinicId],
    queryFn: () => fetchPaymentStats(clinicId),
    staleTime: 60 * 1000,
  });
}

export function useClinicPayments(
  clinicId: number,
  params?: { page?: number; page_size?: number }
) {
  return useQuery({
    queryKey: ["payments", "clinic", clinicId, params],
    queryFn: () => fetchPayments({ ...params, clinic_id: clinicId }),
    staleTime: 60 * 1000,
  });
}

export function useClinicPaymentStats(clinicId: number) {
  return useQuery({
    queryKey: ["payment-stats", "clinic", clinicId],
    queryFn: () => fetchPaymentStats(clinicId),
    staleTime: 60 * 1000,
  });
}
