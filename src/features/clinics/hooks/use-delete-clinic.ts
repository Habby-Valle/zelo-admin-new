"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { deleteClinicApi } from "@/features/clinics/services/clinics.service";

/**
 * Exclusão de clínica. Sem `permanent`, é a exclusão lógica de sempre; com
 * ele, a linha e tudo que depende dela saem do banco de vez.
 */
export function useDeleteClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) =>
      deleteClinicApi(id, { permanent }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() });
      queryClient.removeQueries({ queryKey: clinicKeys.detail(id) });
    },
  });
}
