import PlanDetailClient from "./client"

export const metadata = {
  title: "Detalhes do Plano",
}

interface PlanDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params
  return <PlanDetailClient id={id} />
}
