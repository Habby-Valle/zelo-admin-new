import EditPlanPageClient from "./client";

export const metadata = {
  title: "Editar Plano",
};

interface EditPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params;
  return <EditPlanPageClient id={id} />;
}
