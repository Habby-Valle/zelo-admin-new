import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { LoginForm } from "@/features/auth"

export default function LoginPage() {
  return (
    <Suspense
      fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}
    >
      <LoginForm
        redirectTo="/dashboard"
        title="Super Admin"
        description="Acesse sua conta de administrador global."
      />
    </Suspense>
  )
}
