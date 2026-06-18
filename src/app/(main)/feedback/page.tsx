import { Suspense } from "react"
import { MessageSquare } from "lucide-react"
import { FeedbackPageClient } from "@/features/feedback/components"

export const metadata = {
  title: "Feedbacks",
}

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MessageSquare className="h-6 w-6" />
          Feedbacks
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie os feedbacks enviados por usuários da plataforma.
        </p>
      </div>

      <Suspense fallback={null}>
        <FeedbackPageClient />
      </Suspense>
    </div>
  )
}
