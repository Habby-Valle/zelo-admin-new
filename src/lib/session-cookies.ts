import { NextResponse } from "next/server";
import { decodeJwt } from "@/lib/jwt";

/** Cookie de curta duração que liga a senha ao segundo fator. */
export const MFA_COOKIE = "ze_mfa";
/** Precisa cobrir o MFA_TICKET_TTL da API (5 min), não mais que isso. */
export const MFA_COOKIE_MAX_AGE = 5 * 60;

const isProduction = process.env.NODE_ENV === "production";

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

function maxAgeFromToken(token: string, fallback: number): number {
  const payload = decodeJwt(token);
  if (!payload) return fallback;
  return payload.exp - Math.floor(Date.now() / 1000);
}

/**
 * Grava os cookies de sessão. Só é chamado depois do segundo fator quando o
 * usuário tem 2FA — é o que garante que a senha sozinha não abre o painel.
 */
export function setSessionCookies(response: NextResponse, access: string, refresh: string) {
  response.cookies.set("ze_access", access, {
    ...baseCookie,
    maxAge: maxAgeFromToken(access, 60 * 60 * 24),
  });
  response.cookies.set("ze_refresh", refresh, {
    ...baseCookie,
    maxAge: maxAgeFromToken(refresh, 60 * 60 * 24 * 7),
  });
}

/** O bilhete do segundo fator nunca é exposto ao JavaScript da página. */
export function setMfaCookie(response: NextResponse, mfaToken: string) {
  response.cookies.set(MFA_COOKIE, mfaToken, {
    ...baseCookie,
    maxAge: MFA_COOKIE_MAX_AGE,
  });
}

export function clearMfaCookie(response: NextResponse) {
  response.cookies.delete(MFA_COOKIE);
}
