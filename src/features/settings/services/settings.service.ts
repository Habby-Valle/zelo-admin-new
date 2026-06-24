import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type {
  SystemSettings,
  LgpdConfig,
  UserSearchResult,
} from "@/features/settings/types";

export async function fetchSystemSettings(): Promise<SystemSettings> {
  try {
    const data = await apiFetchClient<{
      is_maintenance: boolean;
      maintenance_message: string;
      maintenance_planned_end: string | null;
      plans_enabled: boolean;
      feedback_visible: boolean;
      apk_url: string;
      apk_enabled: boolean;
      extra: Record<string, unknown>;
      updated_at: string;
    }>("/system-config/");

    const extra = (data.extra ?? {}) as Record<string, string>;

    return {
      maintenance_mode: data.is_maintenance ?? false,
      maintenance_message: data.maintenance_message ?? "",
      maintenance_planned_end: data.maintenance_planned_end ?? null,
      plans_enabled: data.plans_enabled ?? false,
      feedback_visible: data.feedback_visible ?? true,
      apk_url: data.apk_url ?? "",
      apk_enabled: data.apk_enabled ?? false,
      app_name: (extra.app_name as string) ?? "Zelo",
      app_url: (extra.app_url as string) ?? "",
      app_site_url: (extra.app_site_url as string) ?? "",
      app_store_url: (extra.app_store_url as string) ?? "",
      play_store_url: (extra.play_store_url as string) ?? "",
      support_email: (extra.support_email as string) ?? "",
      support_phone: (extra.support_phone as string) ?? "",
      support_whatsapp: (extra.support_whatsapp as string) ?? "",
      admin_logo_url: (extra.admin_logo_url as string) ?? "",
      cnpj: (extra.cnpj as string) ?? "",
      address: (extra.address as string) ?? "",
      timezone: (extra.timezone as string) ?? "America/Sao_Paulo",
      currency: (extra.currency as string) ?? "BRL",
    };
  } catch {
    return {
      maintenance_mode: false,
      maintenance_message: "",
      maintenance_planned_end: null,
      plans_enabled: false,
      feedback_visible: true,
      apk_url: "",
      apk_enabled: false,
      app_name: "Zelo",
      app_url: "",
      app_site_url: "",
      app_store_url: "",
      play_store_url: "",
      support_email: "",
      support_phone: "",
      support_whatsapp: "",
      admin_logo_url: "",
      cnpj: "",
      address: "",
      timezone: "America/Sao_Paulo",
      currency: "BRL",
    };
  }
}

export async function saveSystemSettings(
  data: Partial<SystemSettings & {   admin_logo_media_id?: string | null }>
): Promise<void> {
  const body: Record<string, unknown> = {
    app_name: data.app_name,
    app_url: data.app_url,
    app_site_url: data.app_site_url,
    app_store_url: data.app_store_url,
    play_store_url: data.play_store_url,
    support_email: data.support_email,
    support_phone: data.support_phone,
    support_whatsapp: data.support_whatsapp,
    admin_logo_url: data.admin_logo_url,
    cnpj: data.cnpj,
    address: data.address,
    timezone: data.timezone ?? "America/Sao_Paulo",
    currency: data.currency ?? "BRL",
    is_maintenance: data.maintenance_mode,
    maintenance_message: data.maintenance_message ?? "",
    maintenance_planned_end: data.maintenance_planned_end ?? null,
    plans_enabled: data.plans_enabled,
    feedback_visible: data.feedback_visible,
    apk_url: data.apk_url ?? "",
    apk_enabled: data.apk_enabled ?? false,
  };
  if (data.admin_logo_media_id !== undefined) {
    body.admin_logo_media_id = data.admin_logo_media_id;
  }

  await apiFetchClient("/system-config/", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function changePasswordFetch(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentPassword || !newPassword) {
    return { success: false, error: "Todos os campos são obrigatórios" };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "A nova senha deve ter no mínimo 6 caracteres" };
  }
  if (currentPassword === newPassword) {
    return { success: false, error: "A nova senha deve ser diferente da atual" };
  }

  try {
    await apiFetchClient("/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function fetchLgpdConfig(): Promise<LgpdConfig> {
  try {
    const [encryptionData, retentionData] = await Promise.all([
      apiFetchClient<{
        encryption_key_configured: boolean;
        statuses: {
          field: string;
          table: string;
          label: string;
          encrypted: boolean;
          sample_checked: boolean;
        }[];
      }>("/system-config/encryption-status/"),
      apiFetchClient<
        {
          id: string;
          model_name: string;
          retention_days: number;
          action: string;
          is_active: boolean;
        }[]
      >("/retention-policies/").catch(() => []),
    ]);

    return {
      retention_policies: (retentionData ?? [])
        .filter((p) => p.is_active)
        .map((p) => ({
          id: p.id,
          model_name: p.model_name,
          retention_days: p.retention_days,
        })),
      encryption_key_configured: encryptionData.encryption_key_configured,
      encryption_statuses: (encryptionData.statuses ?? []).map((s) => ({
        table: s.table,
        field: s.field,
        label: s.label,
        sample_checked: s.sample_checked,
        encrypted: s.encrypted,
      })),
    };
  } catch {
    return {
      retention_policies: [],
      encryption_key_configured: false,
      encryption_statuses: [],
    };
  }
}

export async function updateRetentionPolicyFetch(
  policyId: string,
  retentionDays: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetchClient(`/retention-policies/${policyId}/`, {
      method: "PATCH",
      body: JSON.stringify({ retention_days: retentionDays }),
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao atualizar" };
  }
}

export async function searchUsersForLgpdFetch(query: string): Promise<UserSearchResult[]> {
  const searchParams = new URLSearchParams();
  if (query) searchParams.set("search", query);
  const qs = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<UserSearchResult>>(
    `/users/${qs ? `?${qs}` : ""}`
  );
  return data.results.filter((u) => u.role !== "super_admin");
}

export async function createUserSearchResult(
  id: string
): Promise<{ id: string; name: string; email: string; role: string } | null> {
  try {
    const data = await apiFetchClient<{ id: string; name: string; email: string; role: string }>(
      `/users/${id}/`
    );
    return data;
  } catch {
    return null;
  }
}

export async function exportUserDataFetch(
  userId: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const data = await apiFetchClient<Record<string, unknown>>(`/users/${userId}/export/`);
    return { success: true, data: JSON.stringify(data, null, 2) };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao exportar" };
  }
}

export async function exportPatientDataFetch(
  patientId: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const data = await apiFetchClient<Record<string, unknown>>(`/patients/${patientId}/export/`);
    return { success: true, data: JSON.stringify(data, null, 2) };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao exportar" };
  }
}

export async function anonymizeUserFetch(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetchClient(`/users/${userId}/anonymize/`, { method: "POST" });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao anonimizar" };
  }
}

export async function anonymizePatientFetch(
  patientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetchClient(`/patients/${patientId}/anonymize/`, { method: "POST" });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao anonimizar" };
  }
}
