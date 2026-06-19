import { ChecklistsPageClient } from "@/features/checklists/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checklists" };

export default function ChecklistsPage() {
  return <ChecklistsPageClient />;
}
