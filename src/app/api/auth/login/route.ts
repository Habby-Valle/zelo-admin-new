import { NextRequest, NextResponse } from "next/server";
import { isMfaChallenge, loginApi, toPanelSession } from "@/features/auth";
import { ApiError } from "@/lib/api";
import { setMfaCookie, setSessionCookies } from "@/lib/session-cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  let data;
  try {
    data = await loginApi(body.email, body.password);
  } catch (err) {
    if (err instanceof ApiError) {
      const message =
        err.status === 400 ? "E-mail ou senha incorretos." : "Ocorreu um erro. Tente novamente.";
      return NextResponse.json({ error: message }, { status: err.status });
    }
    return NextResponse.json({ error: "Ocorreu um erro. Tente novamente." }, { status: 500 });
  }

  // Segundo fator pendente: nenhum cookie de sessão é gravado aqui. O bilhete
  // vai num cookie httpOnly de 5 minutos, fora do alcance do JavaScript da
  // página, e a checagem de papel fica para depois do código — nesta etapa a
  // API ainda não diz quem é o usuário.
  if (isMfaChallenge(data)) {
    const response = NextResponse.json({
      mfa_required: true,
      mfa_setup_required: data.mfa_setup_required ?? false,
    });
    setMfaCookie(response, data.mfa_token);
    return response;
  }

  const panel = toPanelSession(data.user);
  if (!panel) {
    return NextResponse.json({ error: "Acesso não permitido para este perfil." }, { status: 403 });
  }

  const response = NextResponse.json(panel);
  setSessionCookies(response, data.access, data.refresh);
  return response;
}
