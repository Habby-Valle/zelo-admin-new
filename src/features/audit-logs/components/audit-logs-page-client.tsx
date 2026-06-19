"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Download, Shield } from "lucide-react";
import { useAuditLogs } from "@/features/audit-logs/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

const ACTION_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  status_change: "outline",
  login: "outline",
  invite_sent: "outline",
  invite_accepted: "outline",
  payment_success: "secondary",
  payment_failed: "destructive",
  subscription_activated: "secondary",
  subscription_cancelled: "secondary",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  status_change: "Mudança de Status",
  login: "Login",
  invite_sent: "Convite Enviado",
  invite_accepted: "Convite Aceito",
  payment_success: "Pagamento",
  payment_failed: "Falha Pagamento",
  subscription_activated: "Ativação",
  subscription_cancelled: "Cancelamento",
};

export function AuditLogsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => ({
      action: searchParams.get("action") ?? undefined,
      content_type: searchParams.get("content_type") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      date_from: searchParams.get("date_from") ?? undefined,
      date_to: searchParams.get("date_to") ?? undefined,
      page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10)),
      page_size: 20,
    }),
    [searchParams]
  );

  const { data, isLoading } = useAuditLogs(filters);

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const current: Record<string, string> = {};
      if (filters.action) current.action = filters.action;
      if (filters.content_type) current.content_type = filters.content_type;
      if (filters.search) current.search = filters.search;
      if (filters.date_from) current.date_from = filters.date_from;
      if (filters.date_to) current.date_to = filters.date_to;
      current.page = String(filters.page);

      const merged = { ...current, ...updates };

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all" && v !== "1" && k !== "page") {
          params.set(k, v);
        } else if (k === "page" && v !== "1") {
          params.set(k, v);
        }
      });

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, filters]
  );

  const handleExport = async () => {
    const qs = new URLSearchParams();
    if (filters.action) qs.set("action", filters.action);
    if (filters.content_type) qs.set("content_type", filters.content_type);
    if (filters.search) qs.set("search", filters.search);
    if (filters.date_from) qs.set("date_from", filters.date_from);
    if (filters.date_to) qs.set("date_to", filters.date_to);
    qs.set("page", "1");
    qs.set("page_size", "10000");

    const res = await fetch(`/api/proxy/audit-logs/?${qs}`);
    const data = await res.json();
    const allLogs = data?.logs ?? [];

    const headers = ["Data/Hora", "Usuário", "Email", "Ação", "Entidade", "Descrição"];
    const rows = allLogs.map((log: Record<string, string>) => [
      formatDateTime(log.created_at),
      log.user_name ?? "—",
      log.user_email ?? "—",
      ACTION_LABELS[log.action] ?? log.action,
      log.content_type_name ?? "—",
      log.description,
    ]);

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escape).join(","),
      ...rows.map((r: string[]) => r.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : total.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Logs de Auditoria
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select
              value={filters.action ?? "all"}
              onValueChange={(v) =>
                updateParams({ action: v === "all" ? "" : (v ?? ""), page: "1" })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="status_change">Mudança Status</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="invite_sent">Convite</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.content_type ?? "all"}
              onValueChange={(v) =>
                updateParams({ content_type: v === "all" ? "" : (v ?? ""), page: "1" })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas entidades</SelectItem>
                <SelectItem value="shift">Turno</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="clinic">Clínica</SelectItem>
                <SelectItem value="invite">Convite</SelectItem>
                <SelectItem value="profilecaregiver">Cuidador</SelectItem>
                <SelectItem value="profileguardian">Responsável</SelectItem>
                <SelectItem value="profilefamily">Familiar</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar descrição..."
              value={filters.search ?? ""}
              onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
              className="w-48"
            />

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.date_from ?? ""}
                onChange={(e) => updateParams({ date_from: e.target.value, page: "1" })}
                className="w-36"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={filters.date_to ?? ""}
                onChange={(e) => updateParams({ date_to: e.target.value, page: "1" })}
                className="w-36"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Nenhum log encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user_name ?? "—"}</p>
                          {log.user_email && (
                            <p className="text-xs text-muted-foreground">{log.user_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_COLORS[log.action] ?? "outline"}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.content_type_name ?? log.object_id}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.description}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/audit-logs/${log.id}`)}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {total.toLocaleString("pt-BR")} registro{total !== 1 ? "s" : ""} encontrado
                {total !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1 || isLoading}
                  onClick={() => updateParams({ page: String(filters.page - 1) })}
                >
                  Anterior
                </Button>
                <span>
                  {filters.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages || isLoading}
                  onClick={() => updateParams({ page: String(filters.page + 1) })}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AuditLogsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
