"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSystemSettings,
  saveSystemSettings,
  changePasswordFetch,
  fetchLgpdConfig,
  updateRetentionPolicyFetch,
  exportUserDataFetch,
  exportPatientDataFetch,
  anonymizeUserFetch,
  anonymizePatientFetch,
} from "@/features/settings/services";

export const settingsKeys = {
  all: ["settings"] as const,
  system: () => [...settingsKeys.all, "system"] as const,
  lgpd: () => [...settingsKeys.all, "lgpd"] as const,
};

export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn: fetchSystemSettings,
    staleTime: 60 * 1000,
  });
}

export function useSaveSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof saveSystemSettings>[0]) => saveSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.system() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePasswordFetch(currentPassword, newPassword),
  });
}

export function useLgpdConfig() {
  return useQuery({
    queryKey: settingsKeys.lgpd(),
    queryFn: fetchLgpdConfig,
    staleTime: 60 * 1000,
  });
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, retentionDays }: { policyId: string; retentionDays: number }) =>
      updateRetentionPolicyFetch(policyId, retentionDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lgpd() });
    },
  });
}

export function useExportUserData() {
  return useMutation({
    mutationFn: (userId: string) => exportUserDataFetch(userId),
  });
}

export function useExportPatientData() {
  return useMutation({
    mutationFn: (patientId: string) => exportPatientDataFetch(patientId),
  });
}

export function useAnonymizeUser() {
  return useMutation({
    mutationFn: (userId: string) => anonymizeUserFetch(userId),
  });
}

export function useAnonymizePatient() {
  return useMutation({
    mutationFn: (patientId: string) => anonymizePatientFetch(patientId),
  });
}
