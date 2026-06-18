"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Search, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useFeedbacks, useDeleteFeedback } from "@/features/feedback/hooks"
import type { FeedbackFilters } from "@/features/feedback/types"
import { formatDateTime } from "@/lib/format"

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug",
  feature: "Melhoria",
  compliment: "Elogio",
  other: "Outro",
}

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  bug: "destructive",
  feature: "default",
  compliment: "secondary",
  other: "outline",
}

const STATUS_LABELS: Record<string, string> = {
  received: "Recebido",
  in_review: "Em Análise",
  resolved: "Resolvido",
  closed: "Fechado",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  received: "secondary",
  in_review: "outline",
  resolved: "default",
  closed: "outline",
}

export function FeedbackPageClient() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const filters: FeedbackFilters = useMemo(
    () => ({
      type: typeFilter as FeedbackFilters["type"],
      status: statusFilter as FeedbackFilters["status"],
      search: search || undefined,
      page,
      page_size: 20,
    }),
    [typeFilter, statusFilter, search, page]
  )

  const { data, isLoading } = useFeedbacks(filters)
  const deleteMutation = useDeleteFeedback()

  const feedbacks = data?.feedbacks ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por assunto, mensagem, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-md pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Melhoria</SelectItem>
            <SelectItem value="compliment">Elogio</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="received">Recebido</SelectItem>
            <SelectItem value="in_review">Em Análise</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Tipo</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Enviado por</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Data</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
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
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  Nenhum feedback encontrado
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell>
                    <Badge variant={TYPE_VARIANTS[fb.type] ?? "outline"}>
                      {TYPE_LABELS[fb.type] ?? fb.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-1">{fb.subject}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {fb.user_name ?? <span className="italic">Anônimo</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {fb.clinic_name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[fb.status] ?? "outline"}>
                      {STATUS_LABELS[fb.status] ?? fb.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(fb.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/feedback/${fb.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(fb.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
            Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de{" "}
            {total} feedbacks
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação oculta o feedback da lista. É possível recuperá-lo
              futuramente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget !== null) {
                  deleteMutation.mutate(deleteTarget, {
                    onSettled: () => setDeleteTarget(null),
                  })
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
