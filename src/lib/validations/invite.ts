import { z } from "zod";

export const sendInviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["clinic_admin", "guardian", "caregiver", "family"]),
  clinic_id: z.number().int().positive().nullable().optional(),
});

export type SendInviteValues = z.infer<typeof sendInviteSchema>;
