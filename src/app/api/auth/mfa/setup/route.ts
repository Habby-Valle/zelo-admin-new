import { NextRequest, NextResponse } from "next/server";
import { mfaSetupApi } from "@/features/auth";
import { ApiError } from "@/lib/api";
import { MFA_COOKIE } from "@/lib/session-cookies";

/**
 * Gera o segredo e o QR code.
 *
 * Atende os dois caminhos: o super admin preso no enrolment obrigatório (que
 * ainda não tem sessão, só o bilhete) e quem ativa por opção já logado.
 */
export async function POST(request: NextRequest) {
  const mfaToken = request.cookies.get(MFA_COOKIE)?.value;
  const accessToken = request.cookies.get("ze_access")?.value;

  if (!mfaToken && !accessToken) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  try {
    const data = await mfaSetupApi(accessToken ? { accessToken } : { mfaToken });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Ocorreu um erro. Tente novamente." }, { status: 500 });
  }
}
