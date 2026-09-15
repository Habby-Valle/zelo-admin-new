import { NextRequest, NextResponse } from "next/server";
import { mfaConfirmApi, toPanelSession } from "@/features/auth";
import { ApiError } from "@/lib/api";
import { clearMfaCookie, MFA_COOKIE, setSessionCookies } from "@/lib/session-cookies";

/**
 * Valida o primeiro código e ativa a 2FA.
 *
 * No enrolment obrigatório é este passo que completa o login: a API devolve o
 * par de tokens junto, e só aqui os cookies de sessão nascem.
 */
export async function POST(request: NextRequest) {
  const mfaToken = request.cookies.get(MFA_COOKIE)?.value;
  const accessToken = request.cookies.get("ze_access")?.value;

  if (!mfaToken && !accessToken) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Código obrigatório." }, { status: 400 });
  }

  let data;
  try {
    data = await mfaConfirmApi(code, accessToken ? { accessToken } : { mfaToken });
  } catch (err) {
    if (err instanceof ApiError) {
      const response = NextResponse.json({ error: err.message }, { status: err.status });
      if (err.status === 401) clearMfaCookie(response);
      return response;
    }
    return NextResponse.json({ error: "Ocorreu um erro. Tente novamente." }, { status: 500 });
  }

  const payload: Record<string, unknown> = {
    success: true,
    recovery_codes: data.recovery_codes,
  };

  if (data.access && data.refresh && data.user) {
    const panel = toPanelSession(data.user);
    if (!panel) {
      const response = NextResponse.json(
        { error: "Acesso não permitido para este perfil." },
        { status: 403 }
      );
      clearMfaCookie(response);
      return response;
    }
    const response = NextResponse.json({ ...payload, ...panel });
    setSessionCookies(response, data.access, data.refresh);
    clearMfaCookie(response);
    return response;
  }

  return NextResponse.json(payload);
}
