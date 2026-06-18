"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { clinicKeys } from "@/lib/query-keys"
import { updateClinicApi } from "@/features/clinics/services/clinics.service"

export function useDeactivateClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => updateClinicApi(id, { status: "inactive" }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.detail(id) })
    },
  })
}
