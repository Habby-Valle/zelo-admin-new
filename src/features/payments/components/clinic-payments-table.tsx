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
import type { PaymentRecord } from "@/features/payments/types";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    succeeded: "default",
    processing: "secondary",
    requires_action: "secondary",
    failed: "destructive",
  };

  const labels: Record<string, string> = {
    succeeded: "Sucesso",
    processing: "Processando",
    requires_action: "Ação necessária",
    failed: "Falhou",
  };

  return <Badge variant={variants[status] ?? "outline"}>{labels[status] ?? status}</Badge>;
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

export function ClinicPaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        (payment.plan_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        payment.stripe_payment_intent_id.toLowerCase().includes(search.toLowerCase());

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
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="succeeded">Sucesso</SelectItem>
            <SelectItem value="processing">Processando</SelectItem>
            <SelectItem value="requires_action">Ação necessária</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
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
              <TableHead className="text-right">ID Stripe</TableHead>
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
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                  <TableCell>{formatBillingCycle(payment.billing_cycle)}</TableCell>
                  <TableCell>{formatDate(payment.paid_at) || "-"}</TableCell>
                  <TableCell className="text-right">
                    {payment.stripe_payment_intent_id ? (
                      <a
                        href={`https://dashboard.stripe.com/test/payments/${payment.stripe_payment_intent_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        {payment.stripe_payment_intent_id.slice(0, 12)}...
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
