import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
  gender: z.enum(["M", "F", "O"], { error: "Selecione o sexo" }),
  cpf: z.string().max(14).nullable().optional(),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  clinic_id: z.number().int().positive().nullable().optional(),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).nullable().optional(),
  health_conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  observations: z.string().optional(),
  media_id: z.number().int().positive().nullable().optional(),
  caregiver_ids: z.array(z.string()).optional().default([]),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
