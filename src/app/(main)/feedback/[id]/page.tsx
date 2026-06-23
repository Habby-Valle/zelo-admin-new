import { MessageSquare } from "lucide-react";
import { FeedbackDetailClient } from "@/features/feedback/components";

export const metadata = {
  title: "Detalhes do Feedback",
};

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MessageSquare className="h-6 w-6" />
          Detalhes do Feedback
        </h1>
      </div>

      <FeedbackDetailClient id={id} />
    </div>
  );
}
