import { Suspense } from "react";
import { ComplianceListClient } from "@/features/quality/components";

export const metadata = { title: "Conformidade — Zelo Admin" };

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conformidade de Protocolo</h1>
        <p className="text-sm text-muted-foreground">
          Verificação automática de itens obrigatórios em checklists executados por turno.
        </p>
      </div>
      <Suspense>
        <ComplianceListClient />
      </Suspense>
    </div>
  );
}
