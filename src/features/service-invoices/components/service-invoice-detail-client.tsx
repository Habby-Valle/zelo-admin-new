"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useServiceInvoice, useUpdateServiceInvoiceStatus } from "../hooks";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function formatCurrency(value: string) {
  if (!value || value === "0") return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

interface Props {
  invoiceId: string;
}

export function ServiceInvoiceDetailClient({ invoiceId }: Props) {
  const router = useRouter();
  const { data: invoice, isLoading } = useServiceInvoice(invoiceId);
  const { mutateAsync: updateStatus, isPending: updating } = useUpdateServiceInvoiceStatus(invoiceId);

  const handleMarkPaid = useCallback(async () => {
    try {
      await updateStatus("paid");
    } catch {
      /* handled by react-query */
    }
  }, [updateStatus]);

  const handleCancel = useCallback(async () => {
    try {
      await updateStatus("cancelled");
    } catch {
      /* handled by react-query */
    }
  }, [updateStatus]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Fatura não encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">{invoice.patient_name}</p>
        </div>
        <Badge variant={STATUS_CONFIG[invoice.status]?.variant ?? "outline"} className="ml-auto">
          {STATUS_CONFIG[invoice.status]?.label ?? invoice.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{invoice.clinic_name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDate(invoice.period_start)} a {formatDate(invoice.period_end)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm${invoice.due_date && new Date(invoice.due_date + "T00:00:00") < new Date() && invoice.status === "pending" ? " text-destructive font-medium" : ""}`}>
              {invoice.due_date ? formatDate(invoice.due_date) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatCurrency(invoice.total_amount)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens da Fatura</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Valor Hora</TableHead>
                <TableHead>Adic. Noturno</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum item encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.hours}h</TableCell>
                    <TableCell>{formatCurrency(item.hourly_rate)}</TableCell>
                    <TableCell>{formatCurrency(item.night_surcharge)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {invoice.status === "pending" && (
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Marcar como Pago</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar pagamento</DialogTitle>
                <DialogDescription>
                  Confirmar que a fatura {invoice.invoice_number} foi paga?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                <Button onClick={handleMarkPaid} disabled={updating}>
                  {updating ? "Confirmando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Cancelar Fatura</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar fatura</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja cancelar a fatura {invoice.invoice_number}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>Voltar</Button>
                <Button variant="destructive" onClick={handleCancel} disabled={updating}>
                  {updating ? "Cancelando..." : "Cancelar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Criada em {new Date(invoice.created_at).toLocaleString("pt-BR")}
        {invoice.paid_at ? ` · Paga em ${new Date(invoice.paid_at).toLocaleString("pt-BR")}` : ""}
      </p>
    </div>
  );
}
