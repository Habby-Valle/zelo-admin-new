"use server"

export async function acceptInvitation(
  token: string,
  data: { password: string; confirmPassword: string }
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  try {
    const res = await fetch(`${baseUrl}/api/invites/accept/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: data.password,
        name: "Usuário",
        phone: "",
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: result.error ?? "Erro ao aceitar convite",
      }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Erro ao aceitar convite" }
  }
}
