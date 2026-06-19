"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Plan } from "@/features/plans/types";
import { useDeletePlan, useTogglePlanActive } from "@/features/plans/hooks";
import { formatCurrency } from "@/lib/format";

interface PlanTableProps {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  isActive: string;
  isLoading?: boolean;
  onSearchChange: (v: string) => void;
  onActiveChange: (v: string) => void;
  onPageChange: (v: number) => void;
}

export function PlanTable({
  plans,
  total,
  page,
  pageSize,
  search,
  isActive,
  isLoading,
  onSearchChange,
  onActiveChange,
  onPageChange,
}: PlanTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deletePlan = useDeletePlan();
  const toggleActive = useTogglePlanActive();

  const totalPages = Math.ceil(total / pageSize);

  async function handleDelete() {
    if (!deleteId) return;
    deletePlan.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
          <Select value={isActive} onValueChange={(v) => onActiveChange(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push("/plans/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço mensal</TableHead>
                <TableHead>Preço anual</TableHead>
                <TableHead className="text-center">Benefícios</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-5 w-16" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-8 w-8" />
                      <p>Nenhum plano encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{plan.name}</span>
                        {plan.description && (
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {plan.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(plan.monthly_price)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.yearly_price != null ? formatCurrency(plan.yearly_price) : "—"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {plan.benefits.length}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/plans/${plan.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleActive.mutate({
                                id: plan.id,
                                isActive: !plan.is_active,
                              })
                            }
                            disabled={toggleActive.isPending}
                          >
                            {toggleActive.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : plan.is_active ? (
                              <ToggleLeft className="mr-2 h-4 w-4" />
                            ) : (
                              <ToggleRight className="mr-2 h-4 w-4" />
                            )}
                            {plan.is_active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(plan.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total}{" "}
            resultados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePlan.isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {deletePlan.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
