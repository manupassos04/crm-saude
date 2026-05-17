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

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const clientes = await prisma.cliente.findMany({
    where: { organizationId: orgId },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { dependentes = [], ...d } = body;

  const cliente = await prisma.cliente.create({
    data: {
      tipoPessoa: d.tipoPessoa ?? "PF",
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
      organizationId: orgId,
      dependentes: dependentes.length > 0
        ? {
            create: dependentes
              .filter((dep: { nome?: string; dataNascimento?: string; parentesco?: string }) => dep.nome && dep.dataNascimento && dep.parentesco)
              .map((dep: { nome: string; dataNascimento: string; parentesco: string; cpf?: string; sexo?: string }) => ({
                nome: dep.nome,
                dataNascimento: new Date(dep.dataNascimento),
                parentesco: dep.parentesco,
                cpf: dep.cpf || null,
                sexo: dep.sexo || null,
              })),
          }
        : undefined,
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
