import { z } from "zod";

export const benefitSchema = z.object({
  key: z
    .string()
    .min(2, "Chave deve ter pelo menos 2 caracteres")
    .max(100, "Chave muito longa")
    .regex(/^[a-z0-9_]+$/, "Apenas letras minusculas, numeros e _"),
  label: z
    .string()
    .min(2, "Rotulo deve ter pelo menos 2 caracteres")
    .max(255, "Rotulo muito longo"),
  description: z.string().max(500, "Descricao muito longa").optional(),
});

export type BenefitFormValues = z.infer<typeof benefitSchema>;

export const planBenefitEntrySchema = z.object({
  benefit_id: z.number().int().positive(),
  value: z.string().min(1, "Valor do beneficio e obrigatorio"),
});

export const planSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descricao muito longa").optional(),
  monthly_price: z.number().min(0, "Preco nao pode ser negativo").max(99999.99, "Preco muito alto"),
  yearly_price: z
    .number()
    .min(0, "Preco anual nao pode ser negativo")
    .max(99999.99, "Preco muito alto")
    .nullable()
    .optional(),
  scope: z.enum(["clinic", "guardian"]),
  is_active: z.boolean(),
  benefits: z.array(planBenefitEntrySchema).optional(),
});

export type PlanFormValues = z.infer<typeof planSchema>;
