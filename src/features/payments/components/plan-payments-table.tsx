"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/format";
import type { PlanPaymentRecord } from "@/features/payments/types";

interface PlanPaymentsTableProps {
  payments: PlanPaymentRecord[];
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  all: "Todos",
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
  refunded: "Estornado",
  chargeback: "Chargeback",
};

const PAYMENT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> =
  {
    paid: "default",
    pending: "secondary",
    overdue: "destructive",
    cancelled: "outline",
    refunded: "outline",
    chargeback: "destructive",
  };

const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
};

function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANTS[status] ?? "outline"}>
      {label ?? PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PlanPaymentsTable({ payments }: PlanPaymentsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return payments.filter((p) => {
      const matchesSearch =
        (p.clinic_name ?? "").toLowerCase().includes(term) ||
        (p.plan_name ?? "").toLowerCase().includes(term) ||
        p.asaas_payment_id.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar clínica, plano ou ID do pagamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue>{PAYMENT_STATUS_LABELS[statusFilter] ?? statusFilter}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Estornado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clínica</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Recibo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.clinic_name ?? "—"}</TableCell>
                  <TableCell>{p.plan_name ?? "—"}</TableCell>
                  <TableCell>
                    {p.billing_cycle ? (BILLING_CYCLE_LABELS[p.billing_cycle] ?? p.billing_cycle) : "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(p.amount))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} label={p.status_display} />
                  </TableCell>
                  <TableCell>
                    {p.paid_at ? formatDate(p.paid_at) : formatDate(p.due_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {p.receipt_number ?? "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
