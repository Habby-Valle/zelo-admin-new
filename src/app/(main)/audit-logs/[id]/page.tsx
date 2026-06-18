import { Shield } from "lucide-react"
import { AuditLogDetailClient } from "@/features/audit-logs/components"

export const metadata = {
  title: "Detalhes do Log de Auditoria",
}

interface AuditLogDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AuditLogDetailPage({ params }: AuditLogDetailPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Shield className="h-6 w-6" />
          Detalhes do Log de Auditoria
        </h1>
      </div>

      <AuditLogDetailClient id={id} />
    </div>
  )
}
