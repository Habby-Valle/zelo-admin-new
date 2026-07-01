"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  UserCheck,
  HeartPulse,
  ClipboardCheck,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Star,
} from "lucide-react";

import { useDashboard } from "@/features/dashboard/hooks";
import { KpiCard, KpiCardSkeleton } from "@/features/dashboard/components/kpi-card";
import {
  ClinicStatsTable,
  ClinicStatsTableSkeleton,
} from "@/features/dashboard/components/clinic-stats-table";
import {
  RecentActivityTable,
  RecentActivityTableSkeleton,
} from "@/features/dashboard/components/recent-activity-table";
import { RevenueForecastCards } from "@/features/dashboard/components/revenue-forecast-cards";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";

export function DashboardView() {
  const { data, isLoading, error } = useDashboard();
  console.log(error);
  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Visão geral de toda a plataforma Zelo.</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">Erro ao carregar dados do dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Visão geral de toda a plataforma Zelo.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>

        <ClinicStatsTableSkeleton />
        <RecentActivityTableSkeleton />
      </div>
    );
  }

  const { kpis, clinicStats, revenue, recentActivity } = data;
  const totalSosOpen = kpis.activeSosAlerts + kpis.acknowledgedSosAlerts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Visão geral de toda a plataforma Zelo.</p>
      </div>

      {kpis.activeSosAlerts > 0 && (
        <Link href="/sos?status=active">
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm transition-colors hover:bg-destructive/15">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <span className="font-medium text-destructive">
              {kpis.activeSosAlerts} alerta
              {kpis.activeSosAlerts > 1 ? "s" : ""} SOS ativo
              {kpis.activeSosAlerts > 1 ? "s" : ""} — clique para verificar
            </span>
          </div>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard
          title="Clínicas ativas"
          value={kpis.activeClinics}
          description={`${kpis.totalClinics} cadastradas no total`}
          icon={Building2}
        />
        <KpiCard
          title="Pacientes"
          value={kpis.totalPatients}
          description="Em todas as clínicas"
          icon={HeartPulse}
        />
        <KpiCard
          title="Usuários"
          value={kpis.totalUsers}
          description={`${kpis.totalCaregivers} cuidadores ativos`}
          icon={Users}
        />
        <KpiCard
          title="Turnos em andamento"
          value={kpis.activeShifts}
          description="Agora"
          icon={Activity}
          trend={kpis.activeShifts > 0 ? "up" : "neutral"}
        />
        <KpiCard
          title="Checklists hoje"
          value={kpis.checklistsToday}
          description="Execuções completadas"
          icon={ClipboardCheck}
        />
        <KpiCard
          title="Satisfação"
          value={kpis.avgSatisfaction != null ? `${kpis.avgSatisfaction.toFixed(1)}★` : "—"}
          description={
            kpis.totalRatings > 0
              ? `NPS ${kpis.nps} · ${kpis.totalRatings} avaliação${kpis.totalRatings > 1 ? "ões" : ""}`
              : "Sem avaliações"
          }
          icon={Star}
          trend={kpis.avgSatisfaction != null ? "up" : "neutral"}
        />
        <KpiCard
          title="Admins de clínica"
          value={kpis.totalAdmins}
          description="Contas com role clinic_admin"
          icon={UserCheck}
        />
        <KpiCard
          title="Responsáveis"
          value={kpis.totalGuardians}
          description="Contas com role guardian"
          icon={ShieldCheck}
        />
        <KpiCard
          title="Alertas SOS"
          value={totalSosOpen}
          description={
            kpis.activeSosAlerts > 0
              ? `${kpis.activeSosAlerts} ativo${kpis.activeSosAlerts > 1 ? "s" : ""}, ${kpis.acknowledgedSosAlerts} em atendimento`
              : kpis.acknowledgedSosAlerts > 0
                ? `${kpis.acknowledgedSosAlerts} em atendimento`
                : "Nenhum alerta aberto"
          }
          icon={AlertTriangle}
          trend={kpis.activeSosAlerts > 0 ? "down" : "neutral"}
          className={kpis.activeSosAlerts > 0 ? "border-destructive/50 bg-destructive/5" : ""}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Projeção de Receita</h2>
        <RevenueForecastCards metrics={revenue} />
        {revenue.forecast.length > 0 && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <RevenueChart forecast={revenue.forecast} />
          </div>
        )}
      </div>

      <ClinicStatsTable clinics={clinicStats} />

      <RecentActivityTable logs={recentActivity} />
    </div>
  );
}
