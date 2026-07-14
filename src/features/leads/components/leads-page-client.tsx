"use client";

import { useMemo, useState } from "react";
import { Search, Eye, UserPlus, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLeads, useConvertLead, useUpdateLeadStatus } from "@/features/leads/hooks";
import type { Lead, LeadFilters, LeadStatus } from "@/features/leads/types";
import { formatDateTime } from "@/lib/format";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  converted: "Convertido",
  discarded: "Descartado",
};

const STATUS_VARIANTS: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  contacted: "secondary",
  converted: "outline",
  discarded: "outline",
};

const PAGE_SIZE = 20;

export function LeadsPageClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null);

  const filters: LeadFilters = useMemo(
    () => ({
      status: statusFilter as LeadFilters["status"],
      search: search || undefined,
      page,
      page_size: PAGE_SIZE,
    }),
    [statusFilter, search, page]
  );

  const { data, isLoading } = useLeads(filters);
  const convertMutation = useConvertLead();
  const updateStatus = useUpdateLeadStatus();

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, clínica..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-md pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {statusFilter === "all"
                ? "Todos os status"
                : STATUS_LABELS[statusFilter as LeadStatus]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="new">Novo</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="discarded">Descartado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Data</TableHead>
              <TableHead className="w-28 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-5 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{lead.email}</div>
                    {lead.phone && <div>{lead.phone}</div>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.clinic_name || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.city || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[lead.status] ?? "outline"}>
                      {lead.status_display ?? STATUS_LABELS[lead.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(lead.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewLead(lead)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {lead.status !== "converted" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Converter em convite"
                          onClick={() => setConvertTarget(lead)}
                        >
                          <UserPlus className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      {lead.status !== "discarded" && lead.status !== "converted" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Descartar"
                          onClick={() => updateStatus.mutate({ id: lead.id, status: "discarded" })}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, total)} de {total}{" "}
            leads
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <Dialog open={viewLead !== null} onOpenChange={(open) => !open && setViewLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewLead?.name}</DialogTitle>
            <DialogDescription>Lead recebido pela landing page</DialogDescription>
          </DialogHeader>
          {viewLead && (
            <dl className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">E-mail</dt>
                <dd className="col-span-2">{viewLead.email}</dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Telefone</dt>
                <dd className="col-span-2">{viewLead.phone || "-"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Clínica</dt>
                <dd className="col-span-2">{viewLead.clinic_name || "-"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Cidade</dt>
                <dd className="col-span-2">{viewLead.city || "-"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Mensagem</dt>
                <dd className="col-span-2 whitespace-pre-wrap">{viewLead.message || "-"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Recebido em</dt>
                <dd className="col-span-2">{formatDateTime(viewLead.created_at)}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={convertTarget !== null}
        onOpenChange={(open) => !open && setConvertTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter em convite</AlertDialogTitle>
            <AlertDialogDescription>
              Um convite de administrador de clínica será enviado para{" "}
              <strong>{convertTarget?.email}</strong>. O lead será marcado como convertido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={convertMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={convertMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (convertTarget) {
                  convertMutation.mutate(
                    { id: convertTarget.id, email: convertTarget.email },
                    { onSuccess: () => setConvertTarget(null) }
                  );
                }
              }}
            >
              {convertMutation.isPending ? "Enviando…" : "Enviar convite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
