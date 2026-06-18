import { Suspense } from "react"
import { SubscriptionsPageClient } from "@/features/subscriptions/components"

export const metadata = {
  title: "Assinaturas",
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assinaturas</h1>
        <p className="text-muted-foreground">
          Gerencie as assinaturas de todas as clínicas
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
        <SubscriptionsPageClient />
      </Suspense>
    </div>
  )
}
