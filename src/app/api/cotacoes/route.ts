import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const FAIXAS = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"] as const;

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

  const cotacoes = await prisma.cotacao.findMany({
    where: { organizationId: orgId },
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(cotacoes);
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { nomeCliente, clienteId, vidas, observacoes } = body;

  // Buscar tabela de preços da organização
  const precos = await prisma.tabelaPreco.findMany({ where: { organizationId: orgId } });

  // Agrupar por (operadora, plano, acomodacao, coparticipacao)
  const grupos: Record<string, {
    operadora: string; plano: string; acomodacao: string; coparticipacao: boolean;
    precosPorFaixa: Record<string, number>;
  }> = {};

  for (const p of precos) {
    const key = `${p.operadora}||${p.plano}||${p.acomodacao}||${p.coparticipacao}`;
    if (!grupos[key]) {
      grupos[key] = { operadora: p.operadora, plano: p.plano, acomodacao: p.acomodacao, coparticipacao: p.coparticipacao, precosPorFaixa: {} };
    }
    grupos[key].precosPorFaixa[p.faixaEtaria] = Number(p.valor);
  }

  // Calcular total por grupo
  const resultado = Object.values(grupos).map((g) => {
    let totalVidas = 0;
    let totalValor = 0;
    const detalhePorFaixa: { faixa: string; qtd: number; valorUnitario: number; subtotal: number }[] = [];

    for (const faixa of FAIXAS) {
      const qtd = Number((vidas as Record<string, number>)[faixa] ?? 0);
      if (qtd === 0) continue;
      const valorUnitario = g.precosPorFaixa[faixa] ?? 0;
      const subtotal = qtd * valorUnitario;
      totalVidas += qtd;
      totalValor += subtotal;
      detalhePorFaixa.push({ faixa, qtd, valorUnitario, subtotal });
    }

    return {
      operadora: g.operadora,
      plano: g.plano,
      acomodacao: g.acomodacao,
      coparticipacao: g.coparticipacao,
      totalVidas,
      totalValor,
      detalhePorFaixa,
    };
  }).filter((r) => r.totalVidas > 0).sort((a, b) => a.totalValor - b.totalValor);

  const cotacao = await prisma.cotacao.create({
    data: {
      nomeCliente,
      clienteId: clienteId || null,
      vidas,
      resultado,
      observacoes: observacoes || null,
      organizationId: orgId,
    },
  });

  return NextResponse.json({ ...cotacao, resultado }, { status: 201 });
}
