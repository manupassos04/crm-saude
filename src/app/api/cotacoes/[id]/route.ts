import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  return userDb?.organizationId ?? null;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const cotacao = await prisma.cotacao.findFirst({ where: { id, organizationId: orgId } });
  if (!cotacao) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.cotacao.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
