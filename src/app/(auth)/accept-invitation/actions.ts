"use server";

export async function acceptInvitation(
  token: string,
  data: {
    password: string;
    confirmPassword: string;
    name?: string;
    phone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${apiUrl}/invites/accept/${token}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: data.password,
        name: data.name ?? "Usuário",
        phone: data.phone ?? "",
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result.error ?? "Erro ao aceitar convite",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao aceitar convite" };
  }
}
