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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.cliente.findFirst({ where: { id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();
  const { dependentes = [], ...d } = body;

  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      tipoPessoa: d.tipoPessoa ?? existing.tipoPessoa,
      nome: d.nome,
      cpf: d.cpf || null,
      dataNascimento: d.dataNascimento ? new Date(d.dataNascimento) : null,
      sexo: d.sexo || null,
      estadoCivil: d.estadoCivil || null,
      profissao: d.profissao || null,
      cnpj: d.cnpj || null,
      cnpjMei: d.cnpjMei ?? false,
      razaoSocial: d.razaoSocial || null,
      telefoneCelular1: d.telefoneCelular1,
      telefoneCelular2: d.telefoneCelular2 || null,
      telefoneFix: d.telefoneFix || null,
      emailTitular: d.emailTitular || null,
      emailContato1: d.emailContato1 || null,
      emailContato2: d.emailContato2 || null,
      cep: d.cep || null,
      logradouro: d.logradouro || null,
      numero: d.numero || null,
      complemento: d.complemento || null,
      bairro: d.bairro || null,
      cidade: d.cidade || null,
      uf: d.uf || null,
      cidadePreferencia: d.cidadePreferencia || null,
      dependentes: {
        deleteMany: {},
        create: dependentes
          .filter((dep: { nome?: string; dataNascimento?: string; parentesco?: string }) =>
            dep.nome && dep.dataNascimento && dep.parentesco)
          .map((dep: { nome: string; dataNascimento: string; parentesco: string; cpf?: string; sexo?: string }) => ({
            nome: dep.nome,
            dataNascimento: new Date(dep.dataNascimento),
            parentesco: dep.parentesco,
            cpf: dep.cpf || null,
            sexo: dep.sexo || null,
          })),
      },
    },
  });

  return NextResponse.json(cliente);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.cliente.findFirst({ where: { id, organizationId: orgId } });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.cliente.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
