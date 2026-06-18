# CLAUDE.md — Zelo Admin (Super Admin)

Você é um engenheiro sênior especialista em Next.js, TypeScript, TanStack Query e integração com APIs REST (Django). Priorize código limpo, seguro e escalável.

---

## Visão Geral

O **Zelo** é uma plataforma de gestão de cuidados com pacientes (principalmente idosos). Este projeto é o **Painel Super Admin** — acesso global à plataforma.

---

## Tech Stack (obrigatório seguir)

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript strict |
| Estilo | Tailwind CSS v4 + shadcn/ui + lucide-react |
| Backend | API REST Django |
| Estado | Zustand + TanStack Query |
| Formulários | React Hook Form + Zod |
| Deploy | Vercel |
| Lint | ESLint + Prettier |

> Não introduzir dependências fora desta stack sem alinhamento explícito.

---

## Estrutura de Pastas

```
my-app/
├── .env.local
├── next.config.ts
├── tsconfig.json
├── package.json
│
└── src/
    ├── app/                        ← App Router (Next.js 16)
    │   ├── layout.tsx              ← Root layout + QueryClientProvider
    │   ├── page.tsx                ← Redirect para /dashboard
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   └── (main)/
    │       ├── layout.tsx          ← Layout com sidebar
    │       ├── dashboard/page.tsx
    │       ├── clinics/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── users/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── patients/
    │       ├── checklists/
    │       ├── reports/
    │       ├── audit-logs/
    │       ├── settings/
    │       ├── sos/
    │       ├── subscriptions/
    │       └── payments/
    │
    ├── components/
    │   ├── ui/                     ← shadcn/ui — NÃO MODIFICAR
    │   └── layout/                 ← sidebar, topbar, providers
    │
    ├── features/                   ← lógica + componentes por domínio
    │   └── [domínio]/
    │       ├── index.ts            ← barrel: re-exporta tudo do domínio
    │       ├── components/
    │       │   ├── index.ts        ← barrel dos componentes
    │       │   └── ...
    │       ├── hooks/
    │       │   ├── index.ts        ← barrel dos hooks
    │       │   └── ...
    │       ├── services/
    │       │   ├── index.ts        ← barrel dos services
    │       │   └── ...
    │       └── types/
    │           └── index.ts        ← barrel dos types
    │
    ├── lib/
    │   └── api.ts                  ← cliente HTTP base (fetch com token JWT)
    │
    ├── store/                      ← Zustand (estado global — ex: auth)
    │   └── authStore.ts
    │
    ├── types/
    │   └── index.ts
    │
    └── utils/
```

---

## Responsabilidades por camada

| Camada | Responsabilidade |
|---|---|
| `app/` | Rotas e páginas — sem lógica de negócio |
| `features/*/services/` | Única camada que chama a API Django |
| `features/*/hooks/` | `useQuery` / `useMutation` — alimenta a UI |
| `lib/api.ts` | Cliente HTTP com base URL e token JWT |
| `store/` | Estado global que não vem da API (auth, preferências) |
| `components/ui/` | Primitivos shadcn/ui — não modificar |

---

## Padrões obrigatórios

### `lib/api.ts`
- Cliente HTTP base com `fetch`
- Injeta `Authorization: Bearer <token>` automaticamente
- Lança erro se `res.ok === false`
- Base URL via `NEXT_PUBLIC_API_URL`

### Services
- Vivem em `features/[domínio]/services/`
- Só importam de `@/lib/api`
- Sem lógica de UI, sem hooks do React
- Funções assíncronas puras com tipos explícitos

### Hooks
- Vivem em `features/[domínio]/hooks/`
- `useQuery` para leitura, `useMutation` para escrita
- `useMutation` sempre chama `invalidateQueries` no `onSuccess`
- Nunca usar `useState` + `useEffect` para buscar dados

### Formulários
- React Hook Form + Zod
- Validação: `.issues[0].message`
- Mutações retornam `{ success: boolean; error?: string }`
- Use `startTransition` para async state updates

### Store (Zustand)
- Apenas estado que não vem da API
- Sem chamadas de API dentro da store
- Ações nomeadas com verbos: `set`, `reset`, `clear`

### Componentes
- Named exports — sem default export (exceto arquivos de rota)
- Props tipadas com `interface` explícita
- Nunca `any` — use `unknown` ou tipo explícito
- Server Components por padrão — `'use client'` só quando necessário

---

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## O que nunca fazer

- ❌ `any` no TypeScript — use `unknown` ou tipo explícito
- ❌ Chamar `fetch` diretamente em componentes ou páginas
- ❌ Chamar a API Django fora de `features/*/services/`
- ❌ Modificar arquivos em `components/ui/` (shadcn)
- ❌ Lógica de negócio dentro de stores Zustand
- ❌ Default export em componentes
- ❌ `useState` + `useEffect` para buscar dados — use `useQuery`
- ❌ Acessar `process.env` diretamente fora de `lib/`

---

## Comandos

```bash
npm run dev        # Desenvolvimento
npm run build      # Build de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

---

_Última atualização: 2026-06-17_