import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * A CSP nasce em modo de observação (`Report-Only`).
 *
 * Em modo bloqueante, uma diretiva estreita demais quebra a página em produção
 * sem aviso. Com `CSP_ENFORCE=true` ela passa a valer de verdade — o caminho é
 * subir assim, ler os relatórios em `/api/csp-report` por alguns dias e só
 * então ligar.
 *
 * Atenção: o Next resolve `headers()` no build e grava o resultado no
 * `routes-manifest.json`. A variável precisa estar presente no **build**;
 * defini-la só no runtime não muda nada.
 */
const cspEnforced = process.env.CSP_ENFORCE === "true";

const cspDirectives: Record<string, string[]> = {
  "default-src": ["'self'"],

  // O Next injeta scripts inline no bootstrap da página; sem nonce (que exigiria
  // gerar um por request no proxy), 'unsafe-inline' é o que mantém a página de
  // pé. Em desenvolvimento, o React Refresh também usa eval.
  "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],

  // Tailwind e os componentes do Radix escrevem estilo inline; o Material Icons
  // vem por <link> do Google no layout raiz.
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],

  // As imagens (logo de clínica, avatares) vêm da API, do MinIO ou do
  // CloudFront, e o host muda por ambiente; `blob:` cobre o preview do upload
  // antes de enviar. Em desenvolvimento a mídia sai por http.
  "img-src": ["'self'", "data:", "blob:", "https:", ...(isDev ? ["http:"] : [])],

  // O painel fala com a API pelo próprio domínio (/api/proxy). O resto é
  // telemetria da Vercel e, em desenvolvimento, o websocket do hot reload.
  "connect-src": [
    "'self'",
    "https://vitals.vercel-insights.com",
    ...(isDev ? ["ws:", "wss:", "http://localhost:*"] : []),
  ],

  "worker-src": ["'self'", "blob:"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  // Clickjacking: nenhum site pode embutir o painel num iframe.
  "frame-ancestors": ["'none'"],
};

function buildCsp(): string {
  const directives = Object.entries(cspDirectives).map(
    ([name, values]) => `${name} ${values.join(" ")}`
  );
  if (!isDev) directives.push("report-uri /api/csp-report");
  return directives.join("; ");
}

/** Desliga o que o painel não usa, para o caso de uma página ser comprometida. */
const permissionsPolicy = [
  "accelerometer=()",
  "camera=()",
  "display-capture=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

const nextConfig: NextConfig = {
  // Não anuncia a versão do Next em cada resposta.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: cspEnforced
              ? "Content-Security-Policy"
              : "Content-Security-Policy-Report-Only",
            value: buildCsp(),
          },
          // Redundante com frame-ancestors, mas continua valendo em navegador
          // antigo que ignora a CSP.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
