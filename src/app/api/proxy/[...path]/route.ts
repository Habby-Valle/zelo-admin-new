import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
/** Com barra no fim para que `new URL(relativo, base)` mantenha o prefixo da API. */
const API_BASE = new URL(API_URL.endsWith("/") ? API_URL : `${API_URL}/`);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Cabeçalhos devolvidos ao browser. Lista fechada porque a resposta da API
 * pode trazer `set-cookie` e outros cabeçalhos de sessão que não têm por que
 * atravessar o proxy.
 */
const ALLOWED_RESPONSE_HEADERS = new Set([
  "content-type",
  "content-disposition",
  "content-language",
  "cache-control",
  "etag",
  "last-modified",
]);

const GENERIC_ERROR = "Não foi possível falar com a API.";

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

/**
 * Um segmento é uma parte só do caminho. O Next entrega os segmentos já
 * decodificados, então um `..%2F` chega aqui como `../` — é neste ponto que a
 * travessia é barrada, antes de a URL ser montada.
 */
function isSafeSegment(segment: string): boolean {
  if (!segment || segment === "." || segment === "..") return false;
  if (segment.includes("/") || segment.includes("\\")) return false;
  return !hasControlChars(segment);
}

function buildTargetUrl(path: string[], search: string): URL | null {
  if (!path.length || !path.every(isSafeSegment)) return null;

  const relative = `${path.join("/")}/${search}`;
  const url = new URL(relative, API_BASE);

  // Cinto e suspensório: mesmo com os segmentos validados, a URL final tem de
  // continuar sob a origem e o prefixo da API.
  if (url.origin !== API_BASE.origin) return null;
  if (!url.pathname.startsWith(API_BASE.pathname)) return null;

  return url;
}

/**
 * Só aceita escrita vinda do próprio painel.
 *
 * Sem isto, outro site aberto no mesmo browser podia disparar POST/DELETE
 * aqui: o cookie `ze_access` é `SameSite=lax`, que não cobre toda requisição
 * de outra origem.
 */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origin === request.nextUrl.origin;

  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";

  return false;
}

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;

  if (MUTATING_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }

  const url = buildTargetUrl(path, request.nextUrl.search);
  if (!url) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const token = request.cookies.get("ze_access")?.value;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const contentType = request.headers.get("content-type");
  const isFormData = contentType?.includes("multipart/form-data");
  if (contentType && !isFormData) {
    headers["Content-Type"] = contentType;
  }

  const body = isFormData ? await request.formData() : await request.text().catch(() => undefined);

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body: body || undefined,
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      return followRedirect(res, request, headers, url);
    }

    return proxyResponse(res);
  } catch {
    // A mensagem do erro interno (host, porta, motivo da falha de conexão) não
    // volta para o browser.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}

/**
 * Segue o redirecionamento só quando é seguro.
 *
 * Antes, o `Authorization: Bearer` ia junto para qualquer `Location`: bastava
 * a API responder com um destino em outro host para o proxy entregar o JWT do
 * super admin a esse host. Agora só segue dentro da própria API, e só em
 * GET/HEAD — reenviar o corpo de um POST para outro endereço muda o que a
 * requisição significa.
 */
async function followRedirect(
  res: Response,
  request: NextRequest,
  headers: Record<string, string>,
  requested: URL
): Promise<NextResponse> {
  const location = res.headers.get("location");
  const isSafeMethod = request.method === "GET" || request.method === "HEAD";

  if (!location || !isSafeMethod) return blockedRedirect();

  let target: URL;
  try {
    target = new URL(location, requested);
  } catch {
    return blockedRedirect();
  }

  if (target.origin !== API_BASE.origin || !target.pathname.startsWith(API_BASE.pathname)) {
    return blockedRedirect();
  }

  const redirected = await fetch(target, { method: request.method, headers, redirect: "manual" });
  if (redirected.status >= 300 && redirected.status < 400) return blockedRedirect();

  return proxyResponse(redirected);
}

/** Sem `Location`, para o browser não repetir a chamada no destino recusado. */
function blockedRedirect(): NextResponse {
  return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
}

function formatHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    if (ALLOWED_RESPONSE_HEADERS.has(key.toLowerCase())) result[key] = value;
  });
  return result;
}

async function proxyResponse(res: Response): Promise<NextResponse> {
  const responseHeaders = formatHeaders(res.headers);
  const responseBody = res.status === 204 ? null : await res.text();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
