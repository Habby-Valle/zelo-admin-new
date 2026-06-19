"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchSubscriptions,
  fetchSubscriptionStats,
  fetchGuardianSubscriptions,
  fetchSubscriptionDetails,
} from "@/features/subscriptions/services";

export function useSubscriptions(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["subscriptions", "list", params],
    queryFn: () => fetchSubscriptions(params),
    staleTime: 60 * 1000,
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ["subscriptions", "stats"],
    queryFn: fetchSubscriptionStats,
    staleTime: 60 * 1000,
  });
}

export function useGuardianSubscriptions(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["subscriptions", "guardian", params],
    queryFn: () => fetchGuardianSubscriptions(params),
    staleTime: 60 * 1000,
  });
}

export function useSubscriptionDetails(id: string) {
  return useQuery({
    queryKey: ["subscriptions", "detail", id],
    queryFn: () => fetchSubscriptionDetails(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
