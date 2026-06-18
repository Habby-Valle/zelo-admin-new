import { Suspense } from "react"
import { SosPageClient } from "@/features/sos/components"

export const metadata = {
  title: "SOS",
}

export default function SosPage() {
  return (
    <Suspense fallback={null}>
      <SosPageClient />
    </Suspense>
  )
}
