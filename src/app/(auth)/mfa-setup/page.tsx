import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MfaSetupForm } from "@/features/auth";

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full max-w-md rounded-xl" />}>
      <MfaSetupForm />
    </Suspense>
  );
}
