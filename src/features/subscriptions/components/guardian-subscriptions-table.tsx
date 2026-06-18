"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/format"
import type { GuardianSubscriptionListItem } from "@/features/subscriptions/types"

interface GuardianSubscriptionsTableProps {
  subscriptions: GuardianSubscriptionListItem[]
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    free: "secondary",
    trial: "secondary",
    expired: "destructive",
    cancelled: "outline",
    canceled: "outline",
  }

  const labels: Record<string, string> = {
    active: "Ativo",
    free: "Gratuito",
    trial: "Trial",
    expired: "Expirado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
  }

  return (
    <Badge variant={variants[status] ?? "outline"}>
      {labels[status] ?? status}
    </Badge>
  )
}

export function GuardianSubscriptionsTable({
  subscriptions,
}: GuardianSubscriptionsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.guardian_name.toLowerCase().includes(search.toLowerCase()) ||
        (sub.guardian_email ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
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
          placeholder="Buscar guardião, email ou plano..."
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
            <SelectItem value="free">Gratuito</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guardião</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stripe</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Próxima cobrança</TableHead>
              <TableHead>Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="font-medium">{sub.guardian_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {sub.guardian_email ?? ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sub.plan_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(sub.plan_price)} / mês
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>
                    {sub.stripe_status ? (
                      <span className="text-sm text-muted-foreground">
                        {sub.stripe_status}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(sub.start_date)}</TableCell>
                  <TableCell>
                    {formatDate(sub.current_period_end)}
                  </TableCell>
                  <TableCell>{formatDate(sub.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
