"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShiftForm, useShift } from "@/features/shifts"
import { Skeleton } from "@/components/ui/skeleton"

interface EditShiftPageProps {
  params: Promise<{ id: string }>
}

export default function EditShiftPage({ params }: EditShiftPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: shift, isLoading } = useShift(Number(id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/shifts/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Turno</h1>
          <p className="mt-1 text-muted-foreground">
            Altere os dados do turno.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : shift ? (
        <ShiftForm shift={shift} />
      ) : (
        <p className="text-muted-foreground">Turno não encontrado.</p>
      )}
    </div>
  )
}
