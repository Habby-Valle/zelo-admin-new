import { Suspense } from "react"
import { Shield } from "lucide-react"
import { AuditLogsClient } from "@/features/audit-logs/components"

export const metadata = {
  title: "Logs de Auditoria",
}

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Shield className="h-6 w-6" />
          Logs de Auditoria
        </h1>
        <p className="mt-1 text-muted-foreground">
          Rastreie todas as ações críticas realizadas na plataforma.
        </p>
      </div>

      <Suspense fallback={null}>
        <AuditLogsClient />
      </Suspense>
    </div>
  )
}
