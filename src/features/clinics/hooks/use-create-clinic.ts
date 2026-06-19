"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { createClinicApi } from "@/features/clinics/services/clinics.service";
import type { ClinicFormValues } from "@/lib/validations/clinic";

export function useCreateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ClinicFormValues) =>
      createClinicApi({
        name: values.name,
        document: values.cnpj.replace(/\D/g, ""),
        address: values.address as Record<string, unknown>,
        phone: values.phone,
        status: values.status,
        media_id: values.media_id ?? undefined,
        admin_email: values.admin_email || undefined,
        plan_id: values.plan_id ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() });
    },
  });
}
