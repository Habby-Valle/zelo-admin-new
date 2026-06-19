import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";

export default async function RootPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ze_access")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const payload = decodeJwt(accessToken);
  if (!payload || isTokenExpired(payload)) {
    redirect("/login");
  }

  if (payload.role === "super_admin") {
    redirect("/dashboard");
  }

  redirect("/login");
}
