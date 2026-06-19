"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { BenefitDialog } from "@/features/plans/components";
import { useBenefits, useDeleteBenefit } from "@/features/plans/hooks";
import type { PlanBenefit } from "@/features/plans/types";

export default function BenefitsPage() {
  const router = useRouter();
  const { data: benefits = [], isLoading } = useBenefits();
  const deleteBenefit = useDeleteBenefit();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlanBenefit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(benefit: PlanBenefit) {
    setEditing(benefit);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteBenefit.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Benefícios</h1>
          <p className="mt-1 text-muted-foreground">
            Catálogo de benefícios disponíveis para configurar nos planos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo benefício
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chave</TableHead>
                <TableHead>Rótulo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-56" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : benefits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Tag className="h-8 w-8" />
                      <p>Nenhum benefício cadastrado</p>
                      <Button variant="outline" size="sm" onClick={openCreate}>
                        Criar primeiro benefício
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                benefits.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{benefit.key}</code>
                    </TableCell>
                    <TableCell className="font-medium">{benefit.label}</TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      <span className="line-clamp-2">{benefit.description || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(benefit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(benefit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BenefitDialog open={dialogOpen} onOpenChange={setDialogOpen} benefit={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir benefício</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este benefício? Planos que o utilizam perderão essa
              associação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBenefit.isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {deleteBenefit.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
