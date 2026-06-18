"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Filter } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/format"
import type { SubscriptionListItem } from "@/features/subscriptions/types"

interface SubscriptionsTableProps {
  subscriptions: SubscriptionListItem[]
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    trial: "secondary",
    free: "outline",
    expired: "destructive",
    cancelled: "outline",
  }

  const labels: Record<string, string> = {
    active: "Ativo",
    trial: "Trial",
    free: "Gratuito",
    expired: "Expirado",
    cancelled: "Cancelado",
  }

  return (
    <Badge variant={variants[status] ?? "outline"}>
      {labels[status] ?? status}
    </Badge>
  )
}

function formatBillingCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  }
  return map[cycle] ?? cycle
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.clinic_name.toLowerCase().includes(search.toLowerCase()) ||
        (sub.clinic_email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        sub.plan_name.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || sub.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [subscriptions, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar clínica, email ou plano..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clínica</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pacientes</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Dias</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                const endDate = sub.end_date ? new Date(sub.end_date) : null
                const now = new Date()
                const daysRemaining = endDate
                  ? Math.ceil(
                      (endDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null
                const displayDays =
                  sub.status === "active" || sub.status === "trial"
                    ? daysRemaining
                    : null

                const patientUsage = sub.patient_usage_percent ?? 0
                const patientColor =
                  patientUsage >= 100
                    ? "text-red-600 font-medium"
                    : patientUsage >= 80
                      ? "text-amber-600"
                      : "text-muted-foreground"

                return (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">{sub.clinic_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {sub.clinic_email ?? ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{sub.plan_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(sub.plan_price)} /{" "}
                        {formatBillingCycle(sub.plan_billing_cycle)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${patientColor}`}>
                        {sub.patient_count ?? 0} /{" "}
                        {sub.max_patients === -1
                          ? "∞"
                          : (sub.max_patients ?? "—")}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(sub.start_date)}</TableCell>
                    <TableCell>
                      {sub.status === "free"
                        ? "—"
                        : formatDate(sub.end_date)}
                    </TableCell>
                    <TableCell>
                      {displayDays !== null && displayDays !== undefined ? (
                        <span
                          className={
                            displayDays <= 7
                              ? "font-medium text-red-600"
                              : displayDays <= 30
                                ? "text-amber-600"
                                : ""
                          }
                        >
                          {displayDays}d
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/subscriptions/${sub.clinic_id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
