"use client";

import { useState, useCallback } from "react";
import { useClinics } from "@/features/clinics/hooks";
import {
  useShiftsReport,
  useChecklistsReport,
  usePatientsGrowthReport,
  useSosReport,
  useCaregiversReport,
  useSatisfactionReport,
} from "@/features/reports/hooks";
import { ReportsFilters } from "@/features/reports/components/reports-filters";
import { ShiftsReport } from "@/features/reports/components/shifts-report";
import { ChecklistsReport } from "@/features/reports/components/checklists-report";
import { PatientsGrowthReport } from "@/features/reports/components/patients-growth-report";
import { SosReport } from "@/features/reports/components/sos-report";
import { CaregiversReport } from "@/features/reports/components/caregivers-report";
import { SatisfactionReport } from "@/features/reports/components/satisfaction-report";
import type { ReportDateRange } from "@/features/reports/types";

function getDefaultDateRange(): ReportDateRange {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().split("T")[0],
    to: now.toISOString().split("T")[0],
  };
}

export function ReportsPageClient() {
  const [filters, setFilters] = useState({
    clinicId: "all",
    dateRange: getDefaultDateRange(),
  });

  const { data: clinicsData } = useClinics({ pageSize: 999 });
  const clinics = clinicsData?.results ?? [];

  const shiftsQuery = useShiftsReport(filters);
  const checklistsQuery = useChecklistsReport(filters);
  const patientsQuery = usePatientsGrowthReport(filters);
  const sosQuery = useSosReport(filters);
  const caregiversQuery = useCaregiversReport(filters);
  const satisfactionQuery = useSatisfactionReport(filters);

  const handleFilterChange = useCallback(
    (newFilters: { clinicId: string; dateRange: ReportDateRange }) => {
      setFilters(newFilters);
    },
    []
  );

  const isPending = shiftsQuery.isLoading || checklistsQuery.isLoading || patientsQuery.isLoading;

  const downloadCsv = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToCsv = (headers: string[], rows: string[][]): string => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const headerRow = headers.map(escape).join(",");
    const dataRows = rows.map((row) => row.map(escape).join(","));
    return [headerRow, ...dataRows].join("\n");
  };

  const shiftsData = shiftsQuery.data ?? [];
  const checklistsData = checklistsQuery.data ?? [];
  const patientsData = patientsQuery.data ?? [];

  const exportShiftsCsv = () => {
    const rows = shiftsData.map((d) => [
      d.date,
      String(d.total),
      String(d.completed),
      String(d.cancelled),
    ]);
    downloadCsv(
      exportToCsv(["Data", "Total", "Concluídos", "Cancelados"], rows),
      "relatorio-turnos.csv"
    );
  };

  const exportChecklistsCsv = () => {
    const rows = checklistsData.map((d) => [d.date, String(d.completed), String(d.pending)]);
    downloadCsv(exportToCsv(["Data", "Concluídos", "Pendentes"], rows), "relatorio-checklists.csv");
  };

  const exportPatientsCsv = () => {
    const rows = patientsData.map((d) => [d.month, String(d.total), String(d.new)]);
    downloadCsv(exportToCsv(["Mês", "Total", "Novos"], rows), "relatorio-pacientes.csv");
  };

  const exportSosCsv = () => {
    const sosData = sosQuery.data;
    if (!sosData) return;
    const rows = sosData.byDate.map((d) => [
      d.date,
      String(d.total),
      String(d.acknowledged),
      String(d.resolved),
    ]);
    downloadCsv(
      exportToCsv(["Data", "Total", "Confirmados", "Resolvidos"], rows),
      "relatorio-sos.csv"
    );
  };

  const exportCaregiversCsv = () => {
    const rows = (caregiversQuery.data ?? []).map((d) => [
      d.caregiverName,
      String(d.totalShifts),
      String(d.completedShifts),
      String(d.cancelledShifts),
      String(d.completedChecklists),
    ]);
    downloadCsv(
      exportToCsv(["Cuidador", "Turnos", "Concluídos", "Cancelados", "Checklists"], rows),
      "relatorio-cuidadores.csv"
    );
  };

  const exportSatisfactionCsv = () => {
    const rows = (satisfactionQuery.data?.byCaregiver ?? []).map((d) => [
      d.caregiverName,
      String(d.total),
      d.avgSatisfaction != null ? String(d.avgSatisfaction) : "",
      d.nps != null ? String(d.nps) : "",
    ]);
    downloadCsv(
      exportToCsv(["Cuidador", "Avaliações", "Média", "NPS"], rows),
      "relatorio-satisfacao.csv"
    );
  };

  return (
    <div className="space-y-6">
      <ReportsFilters
        clinics={clinics}
        clinicId={filters.clinicId}
        onFilterChange={handleFilterChange}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ShiftsReport data={shiftsData} loading={isPending} onExport={exportShiftsCsv} />
        <ChecklistsReport
          data={checklistsData}
          loading={isPending}
          onExport={exportChecklistsCsv}
        />
      </div>

      <PatientsGrowthReport data={patientsData} loading={isPending} onExport={exportPatientsCsv} />

      <div className="grid gap-6 md:grid-cols-2">
        <SosReport
          data={
            sosQuery.data ?? {
              summary: {
                total: 0,
                active: 0,
                acknowledged: 0,
                resolved: 0,
                avgResponseTimeMinutes: null,
              },
              byPatient: [],
              byDate: [],
            }
          }
          loading={sosQuery.isLoading}
          onExport={exportSosCsv}
        />
        <CaregiversReport
          data={caregiversQuery.data ?? []}
          loading={caregiversQuery.isLoading}
          onExport={exportCaregiversCsv}
        />
      </div>

      <SatisfactionReport
        data={
          satisfactionQuery.data ?? {
            summary: { avgSatisfaction: null, nps: null, totalRatings: 0 },
            byCaregiver: [],
            byDate: [],
          }
        }
        loading={satisfactionQuery.isLoading}
        onExport={exportSatisfactionCsv}
      />
    </div>
  );
}
