import { BarChart3 } from "lucide-react"
import { ReportsPageClient } from "@/features/reports/components"

export const metadata = {
  title: "Relatórios",
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <BarChart3 className="h-6 w-6" />
          Relatórios
        </h1>
        <p className="mt-1 text-muted-foreground">
          Relatórios consolidados e analytics da plataforma.
        </p>
      </div>

      <ReportsPageClient />
    </div>
  )
}
