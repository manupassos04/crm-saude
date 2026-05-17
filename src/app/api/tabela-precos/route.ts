import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  return userDb?.organizationId ?? null;
}

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const precos = await prisma.tabelaPreco.findMany({
    where: { organizationId: orgId },
    orderBy: [{ operadora: "asc" }, { plano: "asc" }, { faixaEtaria: "asc" }],
  });

  return NextResponse.json(precos);
}
