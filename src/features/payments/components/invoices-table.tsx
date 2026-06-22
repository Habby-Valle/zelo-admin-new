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
import { ExternalLink, Filter } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/format";
import type { InvoiceRecord } from "@/features/payments/types";

interface InvoicesTableProps {
  invoices: InvoiceRecord[];
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  all: "Todos",
  paid: "Pago",
  open: "Em aberto",
  void: "Anulado",
  uncollectible: "Não cobrável",
};

const INVOICE_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> =
  {
    paid: "default",
    open: "secondary",
    void: "outline",
    uncollectible: "destructive",
  };

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={INVOICE_STATUS_VARIANTS[status] ?? "outline"}>
      {INVOICE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={type === "clinic" ? "secondary" : "outline"}>
      {type === "clinic" ? "Clínica" : "Guardião"}
    </Badge>
  );
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        inv.stripe_invoice_id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar nome ou ID da fatura..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue>{INVOICE_STATUS_LABELS[statusFilter] ?? statusFilter}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="open">Em aberto</SelectItem>
            <SelectItem value="void">Anulado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titular</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Fatura Stripe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nenhuma fatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.owner_name}</TableCell>
                  <TableCell>
                    <TypeBadge type={inv.owner_type} />
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(inv.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>
                    {inv.paid_at ? formatDate(inv.paid_at) : formatDate(inv.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {inv.invoice_url ? (
                      <a
                        href={inv.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        {inv.stripe_invoice_id.slice(0, 12)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {inv.stripe_invoice_id.slice(0, 14)}...
                      </span>
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
