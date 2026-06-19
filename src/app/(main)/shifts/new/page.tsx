"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShiftForm } from "@/features/shifts/components";

export default function NewShiftPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/shifts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Turno</h1>
          <p className="mt-1 text-muted-foreground">Crie um novo turno de cuidado.</p>
        </div>
      </div>
      <ShiftForm />
    </div>
  );
}
