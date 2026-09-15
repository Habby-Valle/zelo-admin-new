"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import type { PanelSession } from "@/features/auth";

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Ocorreu um erro.");
  }
  return data as T;
}

export interface MfaSetupResult {
  secret: string;
  otpauth_uri: string;
  qr_svg: string;
}

export type MfaVerifyResult = PanelSession & {
  used_recovery_code: boolean;
  recovery_codes_remaining: number;
};

export type MfaConfirmResult = Partial<PanelSession> & {
  success: boolean;
  recovery_codes: string[];
};

/** Gera o segredo e o QR code (enrolment obrigatório ou opt-in). */
export function useMfaSetup() {
  return useMutation<MfaSetupResult, ApiError, void>({
    mutationFn: () => post<MfaSetupResult>("/api/auth/mfa/setup"),
  });
}

/** Confirma o primeiro código e ativa a 2FA. */
export function useMfaConfirm() {
  return useMutation<MfaConfirmResult, ApiError, { code: string }>({
    mutationFn: ({ code }) => post<MfaConfirmResult>("/api/auth/mfa/confirm", { code }),
  });
}

/** Segunda etapa do login. */
export function useMfaVerify() {
  return useMutation<MfaVerifyResult, ApiError, { code: string }>({
    mutationFn: ({ code }) => post<MfaVerifyResult>("/api/auth/mfa/verify", { code }),
  });
}
