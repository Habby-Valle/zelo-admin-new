import type { Metadata } from "next"
import { SubscriptionDetailView } from "@/features/subscriptions/components"

export const metadata: Metadata = {
  title: "Detalhes da Assinatura",
}

export default async function SubscriptionDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return <SubscriptionDetailView id={id} />
}
