"use client";

import { useInvoices } from "@/features/payments/hooks";
import { InvoicesTable } from "./invoices-table";
import { PaymentStatsCards } from "./payment-stats-cards";

export function PaymentsPageClient() {
  const { data, isLoading } = useInvoices({ page_size: 100 });

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

  const invoices = data?.invoices ?? [];
  const paid = invoices.filter((i) => i.status === "paid").length;

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
      <InvoicesTable invoices={invoices} />
    </>
  );
}
