import { UserDetailClient } from "@/features/users/components"

export const metadata = {
  title: "Detalhes do Usuário",
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  return <UserDetailClient id={id} />
}
