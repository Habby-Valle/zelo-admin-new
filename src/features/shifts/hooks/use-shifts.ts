"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftKeys } from "@/lib/query-keys";
import {
  fetchShifts,
  fetchShift,
  createShiftFetch,
  updateShiftFetch,
  deleteShiftFetch,
  updateShiftStatusFetch,
  addShiftPatientFetch,
  removeShiftPatientFetch,
} from "@/features/shifts/services";
import type { ShiftFilters } from "@/features/shifts/types";

export function useShifts(params?: ShiftFilters) {
  return useQuery({
    queryKey: shiftKeys.list(params ?? {}),
    queryFn: () => fetchShifts(params),
  });
}

export function useShift(id: string) {
  return useQuery({
    queryKey: shiftKeys.detail(id),
    queryFn: () => fetchShift(id),
    enabled: !!id,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createShiftFetch>[0]) => createShiftFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
    },
  });
}

export function useUpdateShift(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateShiftFetch>[1]) => updateShiftFetch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shiftKeys.detail(id) });
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShiftFetch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
    },
  });
}

export function useUpdateShiftStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateShiftStatusFetch(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shiftKeys.detail(id) });
    },
  });
}

export function useAddShiftPatient(shiftId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => addShiftPatientFetch(shiftId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.detail(shiftId) });
    },
  });
}

export function useRemoveShiftPatient(shiftId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => removeShiftPatientFetch(shiftId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.detail(shiftId) });
    },
  });
}
