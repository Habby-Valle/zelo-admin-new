import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, "Código obrigatório")
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d{6}$/, "Código deve conter apenas números"),
});

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const acceptInvitationSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type AcceptInvitationSchema = z.infer<typeof acceptInvitationSchema>;

export const acceptInvitationWithProfileSchema = z
  .object({
    name: z.string().min(1, "Nome obrigatório"),
    phone: z.string().min(1, "Telefone obrigatório"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type AcceptInvitationWithProfileSchema = z.infer<typeof acceptInvitationWithProfileSchema>;

/** Código de 6 dígitos do app autenticador. */
export const mfaCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Código obrigatório")
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d{6}$/, "Código deve conter apenas números"),
});

export type MfaCodeSchema = z.infer<typeof mfaCodeSchema>;

/**
 * Na tela de login, o mesmo campo aceita o código do app (6 dígitos) ou um
 * código de recuperação (10 caracteres, com ou sem hífen).
 */
export const mfaChallengeSchema = z.object({
  code: z
    .string()
    .min(1, "Código obrigatório")
    .refine((value) => {
      const clean = value.trim().replace(/-/g, "").toUpperCase();
      return /^\d{6}$/.test(clean) || /^[A-Z0-9]{10}$/.test(clean);
    }, "Informe o código de 6 dígitos do app ou um código de recuperação"),
});

export type MfaChallengeSchema = z.infer<typeof mfaChallengeSchema>;
