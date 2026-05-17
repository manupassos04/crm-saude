import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { calcularComissao } from "@/lib/comissao";

const STATUS_VALIDOS = ["PENDENTE", "APROVADA", "RECUSADA", "CANCELADA"] as const;
type Status = (typeof STATUS_VALIDOS)[number];

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
  const body = await req.json();

  // Se só vier status, é a troca rápida de status
  if (Object.keys(body).length === 1 && body.status) {
    const status: Status = body.status;
    if (!STATUS_VALIDOS.includes(status))
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });

    const proposta = await prisma.proposta.findFirst({ where: { id, organizationId: orgId } });
    if (!proposta) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

    const atualizada = await prisma.proposta.update({ where: { id }, data: { status } });
    return NextResponse.json(atualizada);
  }

  // Edição completa
  const proposta = await prisma.proposta.findFirst({ where: { id, organizationId: orgId } });
  if (!proposta) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  const valorTotal =
    Number(body.valorSaude) +
    (Number(body.valorOdonto) || 0) +
    (Number(body.valorSOS) || 0) +
    (Number(body.valorAditivos) || 0);
  const comissaoValor = calcularComissao(valorTotal, Number(body.comissaoPorc));

  const atualizada = await prisma.proposta.update({
    where: { id },
    data: {
      clienteId: body.clienteId,
      propostaNumeroInterno: body.propostaNumeroInterno || null,
      propostaNumeroOperadora: body.propostaNumeroOperadora || null,
      operadora: body.operadora,
      plano: body.plano,
      tipoPlano: body.tipoPlano,
      formaContratacao: body.formaContratacao,
      acomodacao: body.acomodacao,
      abrangencia: body.abrangencia,
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
    },
  });

  return NextResponse.json(atualizada);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const proposta = await prisma.proposta.findFirst({ where: { id, organizationId: orgId } });
  if (!proposta) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  await prisma.proposta.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
