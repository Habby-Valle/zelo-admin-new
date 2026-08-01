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
import { Filter, ExternalLink } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/format";
import type { PlanPaymentRecord } from "@/features/payments/types";

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
    refunded: "secondary",
    chargeback: "destructive",
  };

function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANTS[status] ?? "outline"}>
      {label ?? PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function formatBillingCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  };
  return map[cycle] ?? cycle;
}

function formatPaymentMethod(method: string) {
  if (!method) return "-";
  const map: Record<string, string> = {
    card: "Cartão",
    credit_card: "Cartão de Crédito",
    pix: "PIX",
    bank_transfer: "Transferência",
  };
  return map[method] ?? method;
}

export function ClinicPaymentsTable({ payments }: { payments: PlanPaymentRecord[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        (payment.plan_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        payment.asaas_payment_id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar plano ou ID..."
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
            <SelectItem value="chargeback">Chargeback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">ID Asaas</TableHead>
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
              filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.plan_name ?? "-"}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(payment.amount))}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} label={payment.status_display} />
                  </TableCell>
                  <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                  <TableCell>
                    {payment.billing_cycle ? formatBillingCycle(payment.billing_cycle) : "-"}
                  </TableCell>
                  <TableCell>
                    {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.due_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.asaas_payment_id ? (
                      <a
                        href={`https://sandbox.asaas.com/payments/${payment.asaas_payment_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        {payment.asaas_payment_id.slice(0, 12)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "-"
                    )}
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
