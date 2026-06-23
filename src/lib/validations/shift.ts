import { z } from "zod";

export const shiftStatusSchema = z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
  message: "Status inválido",
});

export const createShiftSchema = z.object({
  caregiver_id: z.string().min(1, "Cuidador inválido"),
  clinic_id: z.string().nullable().optional(),
  start: z.string().min(1, "Data de início obrigatória"),
  end: z.string().min(1, "Data de fim obrigatória"),
  notes: z.string().max(2000).optional(),
});

export const updateShiftSchema = createShiftSchema.partial();

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type ShiftStatusValue = z.infer<typeof shiftStatusSchema>;
