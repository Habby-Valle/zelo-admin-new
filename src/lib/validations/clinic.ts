import { z } from "zod";

function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (d: string, len: number) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(d[len - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calc(digits, 12);
  const d2 = calc(digits, 13);
  return d1 === parseInt(digits[12]) && d2 === parseInt(digits[13]);
}

export const addressSchema = z.object({
  zip_code: z
    .string()
    .min(1, "CEP é obrigatório")
    .refine((v) => v.replace(/\D/g, "").length === 8, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional().default(""),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .length(2, "UF deve ter 2 letras")
    .refine((v) => /^[A-Z]{2}$/.test(v.toUpperCase()), "UF inválida")
    .transform((v) => v.toUpperCase()),
  country: z.string().default("Brasil"),
});

export const clinicSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  cnpj: z.string().min(1, "CNPJ é obrigatório").refine(isValidCnpj, "CNPJ inválido"),
  status: z.enum(["active", "inactive", "suspended"]),
  address: addressSchema,
  phone: z.string().min(1, "Telefone é obrigatório"),
  media_id: z.number().int().positive().nullable().optional(),
  admin_email: z.string().email("Email inválido").optional().or(z.literal("")),
  plan_id: z.number().int().positive().optional().nullable(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
export type ClinicFormValues = z.infer<typeof clinicSchema>;
