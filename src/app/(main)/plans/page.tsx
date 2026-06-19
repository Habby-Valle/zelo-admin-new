"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanTableClient } from "@/features/plans/components";

export default function PlansPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os planos de assinatura da plataforma.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/plans/benefits")}>
          <Tag className="mr-2 h-4 w-4" />
          Benefícios
        </Button>
      </div>

      <Suspense fallback={null}>
        <PlanTableClient />
      </Suspense>
    </div>
  );
}
