import { NextRequest, NextResponse } from "next/server";
import { apiFetchServer } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinicId, planId, billingCycle } = body;

    if (!clinicId || !planId) {
      return NextResponse.json({ error: "clinicId e planId são obrigatórios" }, { status: 400 });
    }

    await apiFetchServer(`/subscriptions/${clinicId}/`, {
      method: "PATCH",
      body: JSON.stringify({
        action: "activate",
        plan_id: planId,
        billing_cycle: billingCycle ?? "monthly",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[activate-subscription] Error:", error);
    return NextResponse.json({ error: "Erro ao ativar assinatura" }, { status: 500 });
  }
}
