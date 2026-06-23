"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { deleteClinicApi } from "@/features/clinics/services/clinics.service";

export function useDeleteClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClinicApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() });
      queryClient.removeQueries({ queryKey: clinicKeys.detail(id) });
    },
  });
}
