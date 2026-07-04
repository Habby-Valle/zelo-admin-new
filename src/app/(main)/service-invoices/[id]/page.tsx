import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ServiceInvoiceDetailClient } from "@/features/service-invoices/components";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Detalhes da Fatura — Zelo Admin" };

export default async function ServiceInvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <Suspense>
      <ServiceInvoiceDetailClient invoiceId={id} />
    </Suspense>
  );
}
