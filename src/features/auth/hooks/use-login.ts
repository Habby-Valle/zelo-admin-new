"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

interface LoginVariables {
  email: string;
  password: string;
}

interface LoginSession {
  role: "super_admin";
  user: {
    id: string;
    email: string;
    name: string;
    role: "super_admin";
    clinic_id: string | null;
  };
}

/** Senha aceita, mas a sessão só nasce depois do segundo fator. */
interface LoginMfaChallenge {
  mfa_required: true;
  mfa_setup_required: boolean;
}

export type LoginResult = LoginSession | LoginMfaChallenge;

export function isMfaChallengeResult(result: LoginResult): result is LoginMfaChallenge {
  return "mfa_required" in result;
}

async function loginRequest(variables: LoginVariables): Promise<LoginResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variables),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Ocorreu um erro.");
  }

  return data as LoginResult;
}

export function useLogin() {
  return useMutation<LoginResult, ApiError, LoginVariables>({
    mutationFn: loginRequest,
  });
}
