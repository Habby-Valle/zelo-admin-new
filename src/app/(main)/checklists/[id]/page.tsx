import { use } from "react";
import { ChecklistDetailClient } from "@/features/checklists/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checklist" };

interface ChecklistDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  const { id } = use(params);
  return <ChecklistDetailClient id={id} />;
}
