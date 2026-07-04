"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { updateClinicApi } from "@/features/clinics/services/clinics.service";

export function useUpdateClinicSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      settings,
    }: {
      id: string;
      settings: {
        weekly_report_enabled?: boolean;
        monthly_report_enabled?: boolean;
      };
    }) => updateClinicApi(id, settings),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() });
    },
  });
}
