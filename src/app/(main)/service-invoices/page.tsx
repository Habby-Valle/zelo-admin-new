import { Suspense } from "react";
import { ServiceInvoicesClient } from "@/features/service-invoices/components";

export const metadata = { title: "Faturas de Serviço — Zelo Admin" };

export default function ServiceInvoicesPage() {
  return (
    <Suspense>
      <ServiceInvoicesClient />
    </Suspense>
  );
}
