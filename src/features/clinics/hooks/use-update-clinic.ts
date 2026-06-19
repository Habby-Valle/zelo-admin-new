"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { updateClinicApi } from "@/features/clinics/services/clinics.service";
import type { ClinicFormValues } from "@/lib/validations/clinic";

export function useUpdateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: ClinicFormValues }) =>
      updateClinicApi(id, {
        name: values.name,
        document: values.cnpj.replace(/\D/g, ""),
        address: values.address as Record<string, unknown>,
        phone: values.phone,
        status: values.status,
        media_id: values.media_id ?? undefined,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clinicKeys.detail(id) });
    },
  });
}
