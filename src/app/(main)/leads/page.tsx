import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { LeadsPageClient } from "@/features/leads/components";

export const metadata = {
  title: "Leads",
};

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Inbox className="h-6 w-6" />
          Leads
        </h1>
        <p className="mt-1 text-muted-foreground">
          Contatos recebidos pela landing page. Converta um lead em convite de clínica.
        </p>
      </div>

      <Suspense fallback={null}>
        <LeadsPageClient />
      </Suspense>
    </div>
  );
}
