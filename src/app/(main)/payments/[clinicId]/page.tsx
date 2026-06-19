import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClinicPaymentsPageClient } from "@/features/payments/components";

export const metadata = {
  title: "Extrato - Pagamentos",
};

export default async function ClinicPaymentsPage(props: { params: Promise<{ clinicId: string }> }) {
  const { clinicId: clinicIdStr } = await props.params;
  const clinicId = Number(clinicIdStr);

  if (Number.isNaN(clinicId)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extrato da Clínica</h1>
        <p className="text-muted-foreground">Histórico de pagamentos da clínica</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        }
      >
        <ClinicPaymentsPageClient clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
