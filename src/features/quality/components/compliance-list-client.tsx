"use client";

import { ClipboardCheck, ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useComplianceList, useComplianceStats } from "@/features/quality/hooks";
import type { ProtocolCompliance, ComplianceStats } from "@/features/quality/types";

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ComplianceBadge({ pct }: { pct: number }) {
  if (pct >= 90) {
    return (
      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {formatPct(pct)}
      </Badge>
    );
  }
  if (pct >= 70) {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {formatPct(pct)}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <ShieldAlert className="mr-1 h-3 w-3" />
      {formatPct(pct)}
    </Badge>
  );
}

export function ComplianceListClient() {
  const { data: records, isLoading } = useComplianceList();
  const { data: stats } = useComplianceStats();

  const totalShifts =
    stats?.reduce((acc: number, s: ComplianceStats) => acc + s.total_shifts, 0) ?? 0;
  const totalCaregivers = stats?.length ?? 0;
  const avgCompliance =
    stats && stats.length > 0
      ? stats.reduce((acc: number, s: ComplianceStats) => acc + s.avg_compliance_pct, 0) /
        stats.length
      : null;
  const lowCaregivers =
    stats?.filter((s: ComplianceStats) => s.avg_compliance_pct < 70).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Média</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {avgCompliance !== null ? (
              <div className="text-2xl font-bold">{formatPct(avgCompliance)}</div>
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
            <p className="text-xs text-muted-foreground">Todos os cuidadores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cuidadores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCaregivers}</div>
            <p className="text-xs text-muted-foreground">Com registros de conformidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Turnos Avaliados</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts}</div>
            <p className="text-xs text-muted-foreground">Total com verificação de protocolo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abaixo do Ideal</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={
                lowCaregivers > 0 ? "text-2xl font-bold text-amber-600" : "text-2xl font-bold"
              }
            >
              {lowCaregivers}
            </div>
            <p className="text-xs text-muted-foreground">Cuidadores com &lt;70% de conformidade</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conformidade por Cuidador</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((s: ComplianceStats) => (
                <div
                  key={s.caregiver_id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.caregiver_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.total_shifts} turno{s.total_shifts !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0">
                    <ComplianceBadge pct={s.avg_compliance_pct} />
                  </div>
                </div>
              ))}
            </div>
          ) : !stats ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-muted-foreground">
              Nenhum dado de conformidade encontrado.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cuidador</TableHead>
                  <TableHead>Clínica</TableHead>
                  <TableHead className="text-center">Itens Obrig.</TableHead>
                  <TableHead className="text-center">Completos</TableHead>
                  <TableHead className="text-center">Conformidade</TableHead>
                  <TableHead className="text-center">Desvios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r: ProtocolCompliance) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{formatDateTime(r.shift_date)}</TableCell>
                    <TableCell className="font-medium">{r.caregiver_name}</TableCell>
                    <TableCell>{r.clinic_name}</TableCell>
                    <TableCell className="text-center">{r.total_mandatory}</TableCell>
                    <TableCell className="text-center">{r.completed_mandatory}</TableCell>
                    <TableCell className="text-center">
                      <ComplianceBadge pct={r.compliance_pct} />
                    </TableCell>
                    <TableCell className="text-center">
                      {r.deviations?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-red-600">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {r.deviations.length}
                        </span>
                      ) : (
                        <span className="text-sm text-emerald-600">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum registro de conformidade encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
