import { CaregiverHoursClient } from "@/features/caregiver-hours/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Horas dos Cuidadores" };

export default function CaregiverHoursPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Horas dos Cuidadores</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhamento de horas trabalhadas por cuidador em todas as clínicas.
        </p>
      </div>
      <CaregiverHoursClient />
    </div>
  );
}
