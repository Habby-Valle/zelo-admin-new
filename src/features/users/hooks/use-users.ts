"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/lib/query-keys";
import { fetchUser, fetchUsers, updateUserApi, assignFamilyPlanApi } from "@/features/users/services";

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

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateUserApi>[1];
    }) => updateUserApi(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useAssignFamilyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, planId }: { familyId: string; planId: string }) =>
      assignFamilyPlanApi(familyId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.details() });
    },
  });
}
