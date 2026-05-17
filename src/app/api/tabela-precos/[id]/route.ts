import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { email: user.email! } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userDb = await getUser();
  if (!userDb) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (userDb.role !== "GERENTE") return NextResponse.json({ error: "Apenas gerentes podem editar preços" }, { status: 403 });

  const { id } = await params;
  const { valor } = await req.json();

  const registro = await prisma.tabelaPreco.findFirst({
    where: { id, organizationId: userDb.organizationId },
  });
  if (!registro) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const atualizado = await prisma.tabelaPreco.update({
    where: { id },
    data: { valor: Number(valor) },
  });

  return NextResponse.json(atualizado);
}
