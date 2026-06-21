import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = "/" + path.join("/");
  const search = request.nextUrl.search;
  const pathnameWithSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const url = `${API_URL}${pathnameWithSlash}${search}`;

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
      const location = res.headers.get("location");
      if (location) {
        const redirectedRes = await fetch(location, {
          method: request.method,
          headers,
          body: body || undefined,
        });
        return proxyResponse(redirectedRes);
      }
    }

    return proxyResponse(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do proxy";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function formatHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  const skip = new Set(["content-encoding", "content-length", "transfer-encoding"]);
  headers.forEach((value, key) => {
    if (!skip.has(key)) result[key] = value;
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
export const OPTIONS = proxy;
