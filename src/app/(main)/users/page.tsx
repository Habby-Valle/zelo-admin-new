import { Suspense } from "react";
import { UsersPageClient } from "@/features/users/components";

export const metadata = {
  title: "Usuários",
};

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageClient />
    </Suspense>
  );
}
