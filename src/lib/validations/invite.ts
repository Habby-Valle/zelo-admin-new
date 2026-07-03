import { z } from "zod";

export const sendInviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["super_admin", "clinic_admin", "caregiver", "family"]),
  clinic_id: z.string().nullable().optional(),
});

export type SendInviteValues = z.infer<typeof sendInviteSchema>;
