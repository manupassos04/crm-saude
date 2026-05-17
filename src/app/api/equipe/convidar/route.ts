import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getUserDb() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { email: user.email! } });
}

export async function POST(req: NextRequest) {
  const userDb = await getUserDb();
  if (!userDb) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (userDb.role !== "GERENTE") return NextResponse.json({ error: "Apenas gerentes podem convidar membros" }, { status: 403 });

  const { nome, email } = await req.json();
  if (!nome || !email) return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 400 });

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { nome },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await prisma.user.create({
    data: { email, nome, role: "VENDEDOR", organizationId: userDb.organizationId },
  });

  return NextResponse.json({ ok: true });
}
