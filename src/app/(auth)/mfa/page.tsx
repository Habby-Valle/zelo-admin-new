import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MfaChallengeForm } from "@/features/auth";

export default function MfaPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
      <MfaChallengeForm />
    </Suspense>
  );
}
