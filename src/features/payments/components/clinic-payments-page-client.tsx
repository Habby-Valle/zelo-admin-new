"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useClinicPayments } from "@/features/payments/hooks";
import { ClinicPaymentsTable } from "./clinic-payments-table";
import { ClinicPaymentStatsCards } from "./clinic-payment-stats-cards";

interface ClinicPaymentsPageClientProps {
  clinicId: string;
}

export function ClinicPaymentsPageClient({ clinicId }: ClinicPaymentsPageClientProps) {
  const router = useRouter();
  const { data: paymentsData, isLoading: paymentsLoading } = useClinicPayments(clinicId, {
    page_size: 100,
  });

  if (paymentsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const payments = paymentsData?.payments ?? [];
  const clinicName = payments.length > 0 ? (payments[0].clinic_name ?? "Clínica") : "Clínica";
  const total = payments.length;
  const succeeded = payments.filter((p) => p.status === "paid").length;
  const failed = payments.filter(
    (p) => p.status === "failed" || p.status === "refunded" || p.status === "chargeback"
  ).length;
  const pending = payments.filter(
    (p) =>
      p.status !== "paid" &&
      p.status !== "failed" &&
      p.status !== "refunded" &&
      p.status !== "chargeback"
  ).length;
  const totalRevenue = paymentsData?.total_revenue ?? 0;

  return (
    <>
      <ClinicPaymentStatsCards
        stats={{
          total,
          succeeded,
          failed,
          pending,
          refunded: 0,
          totalRevenue,
        }}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/payments")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">{clinicName}</h2>
      </div>

      <ClinicPaymentsTable payments={payments} />
    </>
  );
}
