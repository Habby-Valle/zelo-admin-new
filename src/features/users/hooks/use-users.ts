"use client";

import { useQuery } from "@tanstack/react-query";
import { userKeys } from "@/lib/query-keys";
import { fetchUser, fetchUsers } from "@/features/users/services";

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useUsers(params?: {
  search?: string;
  role?: string;
  isActive?: string;
  clinicId?: string | number;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: userKeys.list(params ?? {}),
    queryFn: () => fetchUsers(params as Parameters<typeof fetchUsers>[0]),
  });
}
