"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useClinicPayments, useClinicPaymentStats } from "@/features/payments/hooks"
import { ClinicPaymentsTable } from "./clinic-payments-table"
import { ClinicPaymentStatsCards } from "./clinic-payment-stats-cards"

interface ClinicPaymentsPageClientProps {
  clinicId: number
}

export function ClinicPaymentsPageClient({
  clinicId,
}: ClinicPaymentsPageClientProps) {
  const router = useRouter()
  const { data: paymentsData, isLoading: paymentsLoading } = useClinicPayments(
    clinicId,
    { page_size: 100 }
  )
  const { data: stats } = useClinicPaymentStats(clinicId)

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
    )
  }

  const clinicName =
    paymentsData?.payments && paymentsData.payments.length > 0
      ? paymentsData.payments[0].clinic_name
      : "Clínica"

  return (
    <>
      <ClinicPaymentStatsCards
        stats={{
          total: stats?.total ?? 0,
          succeeded: stats?.succeeded ?? 0,
          failed: stats?.failed ?? 0,
          pending: stats?.pending ?? 0,
          refunded: stats?.refunded ?? 0,
          totalRevenue: stats?.total_revenue ?? 0,
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

      <ClinicPaymentsTable payments={paymentsData?.payments ?? []} />
    </>
  )
}
