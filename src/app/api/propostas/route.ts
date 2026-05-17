import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { calcularComissao } from "@/lib/comissao";

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

  const propostas = await prisma.proposta.findMany({
    where: { organizationId: orgId },
    include: { cliente: { select: { id: true, nome: true, razaoSocial: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(propostas);
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const valorTotal = Number(body.valorSaude) + (Number(body.valorOdonto) || 0) + (Number(body.valorSOS) || 0) + (Number(body.valorAditivos) || 0);
  const comissaoValor = calcularComissao(valorTotal, Number(body.comissaoPorc));

  const proposta = await prisma.proposta.create({
    data: {
      clienteId: body.clienteId,
      propostaNumeroInterno: body.propostaNumeroInterno || null,
      propostaNumeroOperadora: body.propostaNumeroOperadora || null,
      operadora: body.operadora,
      plano: body.plano,
      tipoPlano: body.tipoPlano ?? "INDIVIDUAL",
      formaContratacao: body.formaContratacao ?? "LIVRE_ADESAO",
      acomodacao: body.acomodacao ?? "ENFERMARIA",
      abrangencia: body.abrangencia ?? "NACIONAL",
      coparticipacao: body.coparticipacao ?? false,
      reembolso: body.reembolso ?? false,
      quantasVidas: body.quantasVidas ?? null,
      valorSaude: body.valorSaude,
      valorOdonto: body.valorOdonto ?? null,
      valorSOS: body.valorSOS ?? null,
      valorAditivos: body.valorAditivos ?? null,
      temCarencia: body.temCarencia ?? false,
      aproveitamentoCarencia: body.aproveitamentoCarencia ?? false,
      tipoCarencia: body.tipoCarencia ?? null,
      prazoCarenciaDias: body.prazoCarenciaDias ?? null,
      dataVigencia: new Date(body.dataVigencia),
      comissaoPorc: body.comissaoPorc,
      comissaoValor,
      observacoes: body.observacoes || null,
      organizationId: orgId,
    },
  });

  return NextResponse.json(proposta, { status: 201 });
}
