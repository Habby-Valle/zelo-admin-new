import { NextRequest, NextResponse } from "next/server";
import { mfaVerifyApi, toPanelSession } from "@/features/auth";
import { ApiError } from "@/lib/api";
import { clearMfaCookie, MFA_COOKIE, setSessionCookies } from "@/lib/session-cookies";

/** Segunda etapa do login: troca o bilhete + código pelos cookies de sessão. */
export async function POST(request: NextRequest) {
  const mfaToken = request.cookies.get(MFA_COOKIE)?.value;
  if (!mfaToken) {
    return NextResponse.json(
      { error: "Sessão de login expirada. Entre novamente." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Código obrigatório." }, { status: 400 });
  }

  let data;
  try {
    data = await mfaVerifyApi(mfaToken, code);
  } catch (err) {
    if (err instanceof ApiError) {
      const response = NextResponse.json({ error: err.message }, { status: err.status });
      // 401 é bilhete morto (expirado ou queimado por tentativas): o cookie não
      // serve mais para nada, então sai junto e o usuário refaz o login.
      if (err.status === 401) clearMfaCookie(response);
      return response;
    }
    return NextResponse.json({ error: "Ocorreu um erro. Tente novamente." }, { status: 500 });
  }

  const panel = toPanelSession(data.user);
  if (!panel) {
    const response = NextResponse.json(
      { error: "Acesso não permitido para este perfil." },
      { status: 403 }
    );
    clearMfaCookie(response);
    return response;
  }

  const response = NextResponse.json({
    ...panel,
    used_recovery_code: data.used_recovery_code,
    recovery_codes_remaining: data.recovery_codes_remaining,
  });
  setSessionCookies(response, data.access, data.refresh);
  clearMfaCookie(response);
  return response;
}
