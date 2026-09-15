import { apiFetch } from "@/lib/api";

export interface ApiProfile {
  id: string;
  name: string;
  phone: string;
  role: string;
  clinic_id: string | null;
}

export interface ApiUser {
  id: string;
  email: string;
  is_active: boolean;
  mfa_enabled: boolean;
  /** Se o papel obriga verificação em duas etapas (super_admin, hoje). */
  mfa_required: boolean;
  profile: ApiProfile | null;
}

export interface SessionResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

/**
 * A senha correta não basta quando há segundo fator: a API devolve só um
 * bilhete de curta duração, e os tokens de sessão só nascem depois do código.
 */
export interface MfaChallengeResponse {
  mfa_required: true;
  /** true quando o usuário ainda precisa cadastrar o app autenticador. */
  mfa_setup_required?: boolean;
  mfa_token: string;
}

export type LoginResponse = SessionResponse | MfaChallengeResponse;

export function isMfaChallenge(data: LoginResponse): data is MfaChallengeResponse {
  return "mfa_required" in data && data.mfa_required === true;
}

export interface MfaSetupResponse {
  secret: string;
  otpauth_uri: string;
  qr_svg: string;
}

export interface MfaConfirmResponse extends Partial<SessionResponse> {
  success: boolean;
  recovery_codes: string[];
}

export interface MfaVerifyResponse extends SessionResponse {
  used_recovery_code: boolean;
  recovery_codes_remaining: number;
}

export interface RefreshResponse {
  access: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutApi(refreshToken: string, accessToken: string): Promise<void> {
  return apiFetch<void>("/auth/logout/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export async function getMeApi(accessToken: string): Promise<ApiUser> {
  return apiFetch<ApiUser>("/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function refreshTokenApi(refreshToken: string): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>("/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export async function mfaSetupApi(auth: {
  mfaToken?: string;
  accessToken?: string;
}): Promise<MfaSetupResponse> {
  return apiFetch<MfaSetupResponse>("/auth/mfa/setup/", {
    method: "POST",
    headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
    body: JSON.stringify(auth.mfaToken ? { mfa_token: auth.mfaToken } : {}),
  });
}

export async function mfaConfirmApi(
  code: string,
  auth: { mfaToken?: string; accessToken?: string }
): Promise<MfaConfirmResponse> {
  return apiFetch<MfaConfirmResponse>("/auth/mfa/confirm/", {
    method: "POST",
    headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
    body: JSON.stringify({ code, ...(auth.mfaToken ? { mfa_token: auth.mfaToken } : {}) }),
  });
}

export async function mfaVerifyApi(mfaToken: string, code: string): Promise<MfaVerifyResponse> {
  return apiFetch<MfaVerifyResponse>("/auth/mfa/verify/", {
    method: "POST",
    body: JSON.stringify({ mfa_token: mfaToken, code }),
  });
}

export interface PanelSession {
  role: "super_admin";
  user: {
    id: string;
    email: string;
    name: string;
    role: "super_admin";
    clinic_id: string | null;
  };
}

/** Só o super admin entra neste painel; qualquer outro papel vira null. */
export function toPanelSession(user: ApiUser): PanelSession | null {
  const role = user.profile?.role;
  if (role !== "super_admin") return null;
  return {
    role,
    user: {
      id: String(user.id),
      email: user.email,
      name: user.profile?.name ?? "",
      role,
      clinic_id: user.profile?.clinic_id ?? null,
    },
  };
}
