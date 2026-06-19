import { use } from "react";
import { ChecklistDetailClient } from "@/features/checklists/components";

interface ChecklistDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  const { id } = use(params);
  return <ChecklistDetailClient id={Number(id)} />;
}
