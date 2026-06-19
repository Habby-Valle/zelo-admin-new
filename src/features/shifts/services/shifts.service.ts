import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { Shift, ShiftDetail, ShiftPatient, ShiftFilters } from "@/features/shifts/types";

interface ApiShift {
  id: number;
  caregiver_id: number;
  clinic_id: number | null;
  start: string;
  end: string;
  status: string;
  notes: string;
  shift_patients: {
    id: number;
    patient_id: number;
    patient_name: string;
  }[];
  created_at: string;
  updated_at: string;
  caregiver_name?: string;
  clinic_name?: string | null;
  created_by_name?: string | null;
}

function mapShift(api: ApiShift): ShiftDetail {
  return {
    id: api.id,
    caregiver_id: api.caregiver_id,
    clinic_id: api.clinic_id,
    start: api.start,
    end: api.end,
    status: api.status as Shift["status"],
    notes: api.notes,
    shift_patients: (api.shift_patients ?? []).map((sp) => ({
      id: String(sp.id),
      patient_id: String(sp.patient_id),
      patient_name: sp.patient_name,
    })),
    created_at: api.created_at,
    updated_at: api.updated_at,
    caregiver_name: api.caregiver_name ?? "",
    clinic_name: api.clinic_name ?? null,
    created_by_name: api.created_by_name ?? null,
  };
}

export async function fetchShifts(
  params?: ShiftFilters
): Promise<{ shifts: ShiftDetail[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.clinicId) searchParams.set("clinic_id", params.clinicId);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<ApiShift>>(
    `/shifts/${query ? `?${query}` : ""}`
  );
  return { shifts: data.results.map(mapShift), total: data.count };
}

export async function fetchShift(id: number): Promise<ShiftDetail> {
  const data = await apiFetchClient<ApiShift>(`/shifts/${id}/`);
  return mapShift(data);
}

export async function createShiftFetch(data: {
  caregiver_id: number;
  clinic_id?: number | null;
  start: string;
  end: string;
  notes?: string;
}): Promise<ShiftDetail> {
  const result = await apiFetchClient<ApiShift>("/shifts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapShift(result);
}

export async function updateShiftFetch(
  id: number,
  data: Partial<{
    caregiver_id: number;
    clinic_id: number | null;
    start: string;
    end: string;
    notes: string;
  }>
): Promise<ShiftDetail> {
  const result = await apiFetchClient<ApiShift>(`/shifts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return mapShift(result);
}

export async function deleteShiftFetch(id: number): Promise<void> {
  await apiFetchClient<void>(`/shifts/${id}/`, { method: "DELETE" });
}

export async function updateShiftStatusFetch(id: number, status: string): Promise<void> {
  await apiFetchClient<void>(`/shifts/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function addShiftPatientFetch(
  shiftId: number,
  patientId: number
): Promise<ShiftPatient> {
  const result = await apiFetchClient<{ id: number; patient_id: number; patient_name: string }>(
    `/shifts/${shiftId}/patients/`,
    {
      method: "POST",
      body: JSON.stringify({ patient_id: patientId }),
    }
  );
  return {
    id: String(result.id),
    patient_id: String(result.patient_id),
    patient_name: result.patient_name,
  };
}

export async function removeShiftPatientFetch(
  shiftId: number,
  assignmentId: string
): Promise<void> {
  await apiFetchClient<void>(`/shifts/${shiftId}/patients/${assignmentId}/`, {
    method: "DELETE",
  });
}
