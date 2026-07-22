"use client";

import { usePlanPayments } from "@/features/payments/hooks";
import { PlanPaymentsTable } from "./plan-payments-table";
import { PaymentStatsCards } from "./payment-stats-cards";

export function PaymentsPageClient() {
  const { data, isLoading } = usePlanPayments({ page_size: 100 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const payments = data?.payments ?? [];
  const paid = payments.filter((p) => p.status === "paid").length;

  return (
    <>
      <PaymentStatsCards
        stats={{
          total: data?.total ?? 0,
          succeeded: paid,
          failed: 0,
          totalRevenue: data?.total_revenue ?? 0,
        }}
      />
      <PlanPaymentsTable payments={payments} />
    </>
  );
}
