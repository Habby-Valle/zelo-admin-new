import { Suspense } from "react"
import { PaymentsPageClient } from "@/features/payments/components"

export const metadata = {
  title: "Pagamentos",
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground">
          Histórico de pagamentos de todas as clínicas
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-xl bg-muted" />
          </div>
        }
      >
        <PaymentsPageClient />
      </Suspense>
    </div>
  )
}
