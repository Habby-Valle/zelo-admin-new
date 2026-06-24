import { redirect } from "next/navigation";

const VALID_ROLES = ["caregiver", "family"];

export default async function InviteRedirectPage({
  params,
}: {
  params: Promise<{ role: string; token: string }>;
}) {
  const { role, token } = await params;

  if (!VALID_ROLES.includes(role)) {
    redirect("/");
  }

  redirect(`zeloapp://invite/${role}/${token}`);
}
