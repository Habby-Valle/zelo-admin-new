"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientKeys } from "@/lib/query-keys";
import {
  fetchPatients,
  fetchPatient,
  createPatientFetch,
  updatePatientFetch,
  deletePatientFetch,
  addCaregiverFetch,
  removeCaregiverFetch,
  addEmergencyContactFetch,
  removeEmergencyContactFetch,
} from "@/features/patients/services";

export function usePatients(params?: {
  search?: string;
  clinicId?: string;
  guardianId?: string;
  isActive?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: patientKeys.list(params ?? {}),
    queryFn: () => fetchPatients(params),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createPatientFetch>[0]) => createPatientFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePatientFetch>[1] }) =>
      updatePatientFetch(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatientFetch(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
    },
  });
}

export function useAddCaregiver(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caregiverId: string) => addCaregiverFetch(patientId, caregiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
  });
}

export function useRemoveCaregiver(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => removeCaregiverFetch(patientId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
  });
}

export function useAddEmergencyContact(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileFamilyId, priority }: { profileFamilyId: string; priority: number }) =>
      addEmergencyContactFetch(patientId, profileFamilyId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
  });
}

export function useRemoveEmergencyContact(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => removeEmergencyContactFetch(patientId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
  });
}
