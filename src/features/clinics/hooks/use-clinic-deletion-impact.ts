"use client";

import { useQuery } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { getClinicDeletionImpactApi } from "@/features/clinics/services/clinics.service";

/**
 * Prévia do estrago da exclusão permanente, para o diálogo de confirmação.
 * Só busca quando há uma clínica alvo — o diálogo fechado não consulta nada.
 */
export function useClinicDeletionImpact(clinicId: string | null) {
  return useQuery({
    queryKey: [...clinicKeys.detail(clinicId ?? ""), "deletion-impact"],
    queryFn: () => getClinicDeletionImpactApi(clinicId!),
    enabled: !!clinicId,
    staleTime: 0,
  });
}
