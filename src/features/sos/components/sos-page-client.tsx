"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useSosAlerts,
  useSosSummary,
  useAcknowledgeSosAlert,
  useResolveSosAlert,
} from "@/features/sos/hooks";
import { useClinics } from "@/features/clinics/hooks";
import type { SosStatus } from "@/features/sos/types";

const STATUS_LABELS: Record<SosStatus, string> = {
  active: "Ativo",
  acknowledged: "Confirmado",
  resolved: "Resolvido",
};

const STATUS_VARIANTS: Record<SosStatus, "destructive" | "secondary" | "outline"> = {
  active: "destructive",
  acknowledged: "secondary",
  resolved: "outline",
};

const STATUS_ICONS: Record<SosStatus, React.ReactNode> = {
  active: <AlertTriangle className="mr-1 h-3 w-3" />,
  acknowledged: <Clock className="mr-1 h-3 w-3" />,
  resolved: <CheckCircle2 className="mr-1 h-3 w-3" />,
};

export function SosPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "all") as SosStatus | "all";
  const clinicId = searchParams.get("clinicId") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const filters = useMemo(
    () => ({
      status: status as SosStatus | "all",
      clinic_id: clinicId !== "all" ? clinicId : undefined,
      page,
      page_size: pageSize,
    }),
    [status, clinicId, page]
  );

  const { data: alertsData, isLoading: alertsLoading } = useSosAlerts(filters);
  const { data: summary } = useSosSummary(clinicId !== "all" ? clinicId : undefined);

  const { data: clinicsData } = useClinics({ pageSize: 999 });
  const clinics = clinicsData?.results ?? [];

  const acknowledgeMutation = useAcknowledgeSosAlert();
  const resolveMutation = useResolveSosAlert();

  const alerts = alertsData?.alerts ?? [];
  const total = alertsData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const [acknowledgeTarget, setAcknowledgeTarget] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);
  const [resolveReason, setResolveReason] = useState("");

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const current: Record<string, string> = { status, clinicId, page: String(page) };
      const merged = { ...current, ...updates };

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all" && v !== "1") params.set(k, v);
      });

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, status, clinicId, page]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas SOS</h1>
        <p className="mt-1 text-muted-foreground">
          Monitoramento global de alertas de emergência de todas as clínicas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={(summary?.active ?? 0) > 0 ? "border-destructive/50 bg-destructive/5" : ""}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Ativos
            </CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${(summary?.active ?? 0) > 0 ? "text-destructive" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${(summary?.active ?? 0) > 0 ? "text-destructive" : ""}`}
            >
              {summary?.active ?? "..."}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {summary && summary.active > 0
                ? "Requerem atenção imediata"
                : "Nenhum alerta pendente"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Atendimento
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.acknowledged ?? "..."}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Confirmados, aguardando resolução
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolvidos Hoje
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{summary?.resolvedToday ?? "..."}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Encerrados nas últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-2">
            <Select
              value={status}
              onValueChange={(v) => updateParams({ status: v ?? "all", page: "1" })}
            >
              <SelectTrigger className="w-44">
                <SelectValue>
                  {status === "all"
                    ? "Todos os status"
                    : (STATUS_LABELS[status as SosStatus] ?? status)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="acknowledged">Confirmados</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={clinicId}
              onValueChange={(v) => updateParams({ clinicId: v ?? "all", page: "1" })}
            >
              <SelectTrigger className="w-48">
                <SelectValue>
                  {clinicId === "all"
                    ? "Todas as clínicas"
                    : (clinics.find((c) => String(c.id) === clinicId)?.name ?? clinicId)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as clínicas</SelectItem>
                {clinics.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {total} alerta{total !== 1 ? "s" : ""} encontrado
            {total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Disparado por</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Confirmado por</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhum alerta SOS encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.patient_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {alert.clinic_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{alert.caregiver_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_VARIANTS[alert.status]}
                        className="flex w-fit items-center"
                      >
                        {STATUS_ICONS[alert.status]}
                        {STATUS_LABELS[alert.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(alert.triggered_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {alert.acknowledged_by_name ?? <span className="text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {alert.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setAcknowledgeTarget(alert.id)}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Confirmar
                          </Button>
                        )}
                        {alert.status !== "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-green-600 hover:text-green-600"
                            onClick={() => {
                              setResolveTarget(alert.id);
                              setResolveReason("");
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Resolver
                          </Button>
                        )}
                        {alert.status === "resolved" && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            Resolvido
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || alertsLoading}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Anterior
            </Button>
            <span className="text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || alertsLoading}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!acknowledgeTarget}
        onOpenChange={(open) => {
          if (!open) setAcknowledgeTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alerta SOS?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está ciente do alerta e está tomando as providências necessárias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acknowledgeMutation.isPending}>Cancelar</AlertDialogCancel>
            <Button
              onClick={() => {
                if (acknowledgeTarget) {
                  acknowledgeMutation.mutate(String(acknowledgeTarget), {
                    onSettled: () => setAcknowledgeTarget(null),
                  });
                }
              }}
              disabled={acknowledgeMutation.isPending}
            >
              Confirmar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!resolveTarget}
        onOpenChange={(open) => {
          if (!open) {
            setResolveTarget(null);
            setResolveReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolver alerta SOS?</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar o alerta como resolvido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-2">
            <Label htmlFor="resolve-reason" className="text-sm">
              Observações (opcional)
            </Label>
            <Textarea
              id="resolve-reason"
              className="mt-1.5"
              rows={3}
              placeholder="Descreva como o alerta foi resolvido..."
              value={resolveReason}
              onChange={(e) => setResolveReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resolveMutation.isPending}>Cancelar</AlertDialogCancel>
            <Button
              onClick={() => {
                if (resolveTarget) {
                  resolveMutation.mutate(
                    { id: String(resolveTarget), reason: resolveReason || undefined },
                    {
                      onSettled: () => {
                        setResolveTarget(null);
                        setResolveReason("");
                      },
                    }
                  );
                }
              }}
              disabled={resolveMutation.isPending}
            >
              Resolver
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
