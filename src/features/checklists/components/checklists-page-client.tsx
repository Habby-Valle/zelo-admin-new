"use client";

import { useState } from "react";
import Link from "next/link";
import { ListChecks } from "lucide-react";

import { useChecklists } from "@/features/checklists/hooks";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

export function ChecklistsPageClient() {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useChecklists({
    search,
    isActive: isActive === "all" ? "" : isActive,
    page,
    pageSize,
  });

  const checklists = data?.checklists ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="mt-1 text-muted-foreground">
          Templates globais da plataforma e checklists das clínicas (somente leitura).
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar template..."
            className="max-w-xs"
          />
          <Select
            value={isActive}
            onValueChange={(v) => {
              if (v) setIsActive(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {isActive === "all" ? "Todos" : isActive === "true" ? "Ativos" : "Inativos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Nome", "Status", "Clínica", "Itens", "Criado em"].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhum template encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                checklists.map((cl) => {
                  const icon = cl.icon ? (
                    <MaterialIcon name={cl.icon} size="md" />
                  ) : (
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                  );
                  return (
                    <TableRow key={cl.id}>
                      <TableCell className="font-medium">
                        {cl.clinic_id === null ? (
                          <Link
                            href={`/checklists/${cl.id}`}
                            className="flex items-center gap-2 hover:underline"
                          >
                            {icon}
                            {cl.name}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-2">
                            {icon}
                            {cl.name}
                          </span>
                        )}
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
                    </TableRow>
                  );
                })
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
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
