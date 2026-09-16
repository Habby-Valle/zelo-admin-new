import { NextRequest, NextResponse } from "next/server";

/**
 * Coletor dos relatórios da CSP em modo observação.
 *
 * Sem um destino, `Report-Only` só escreve no console de quem estiver com o
 * DevTools aberto — ou seja, ninguém percebe o que precisaria ser liberado
 * antes de ligar o modo bloqueante. Aqui as violações caem no log do servidor.
 */
export async function POST(request: NextRequest) {
  const report = await request.json().catch(() => null);
  const violation = report?.["csp-report"] ?? report;

  if (violation) {
    console.warn("[csp] violação", {
      directive: violation["violated-directive"] ?? violation.effectiveDirective,
      blocked: violation["blocked-uri"] ?? violation.blockedURL,
      document: violation["document-uri"] ?? violation.documentURL,
    });
  }

  // O browser ignora o corpo da resposta deste endpoint.
  return new NextResponse(null, { status: 204 });
}
