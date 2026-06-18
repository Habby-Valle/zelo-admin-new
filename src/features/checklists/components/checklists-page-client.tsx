"use client"

import { useState } from "react"
import Link from "next/link"
import { ListChecks, Pencil, Plus, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useChecklists, useDeleteChecklist, useChecklist } from "@/features/checklists/hooks"
import { useClinics } from "@/features/clinics/hooks"
import type { Checklist, ChecklistDetail } from "@/features/checklists/types"
import { ChecklistDialog } from "./checklist-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MaterialIcon } from "@/components/shared/material-icon"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTablePagination } from "@/components/shared/data-table-pagination"

function EditChecklistDialog({
  id,
  open,
  onOpenChange,
}: {
  id: number
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data: checklist } = useChecklist(id)
  return (
    <ChecklistDialog
      open={open}
      onOpenChange={onOpenChange}
      checklist={checklist as ChecklistDetail | undefined}
    />
  )
}

export function ChecklistsPageClient() {
  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useChecklists({
    search,
    isActive: isActive === "all" ? "" : isActive,
    page,
    pageSize,
  })

  const deleteChecklist = useDeleteChecklist()
  const checklists = data?.checklists ?? []
  const total = data?.total ?? 0

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Checklist | null>(null)

  const openCreate = () => {
    setEditId(null)
    setDialogOpen(true)
  }

  const openEdit = (cl: Checklist) => {
    setEditId(cl.id)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteChecklist.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Template excluído com sucesso.")
        setDeleteTarget(null)
      },
      onError: () => {
        toast.error("Erro ao excluir template.")
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie templates de checklists por clínica.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar template..."
            className="max-w-xs"
          />
          <Select value={isActive} onValueChange={(v) => { if (v) setIsActive(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo template
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Nome", "Status", "Clínica", "Itens", "Criado em", ""].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum template encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                checklists.map((cl) => (
                  <TableRow key={cl.id}>
                    <TableCell className="font-medium">
                      <Link href={`/checklists/${cl.id}`} className="hover:underline flex items-center gap-2">
                        {cl.icon ? (
                          <MaterialIcon name={cl.icon} size="md" />
                        ) : (
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                        )}
                        {cl.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {cl.is_active ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {cl.clinic_name ? (
                        <span className="text-sm">{cl.clinic_name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cl.items_count}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(cl.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(cl)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(cl)}
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
        </div>
      )}

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
      />

      {!editId && (
        <ChecklistDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      )}

      {editId && (
        <EditChecklistDialog
          id={editId}
          open={dialogOpen}
          onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditId(null) }}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              O template <strong>{deleteTarget?.name}</strong> será excluído
              permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChecklist.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
