import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifyOtpForm } from "@/features/auth";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
