import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, FileText } from "lucide-react";
import { ImprimirCotacao } from "@/components/cotacoes/ImprimirCotacao";
import { ExcluirCotacao } from "@/components/cotacoes/ExcluirCotacao";

const ACOMODACAO_LABEL: Record<string, string> = {
  SEMI_PRIVATIVO: "Semi-Privativo", PRIVATIVO: "Privativo", SEM_ACOMODACAO: "Ambulatorial",
};
const FAIXAS_LABEL: Record<string, string> = {
  "0-18": "0 a 18", "19-23": "19 a 23", "24-28": "24 a 28", "29-33": "29 a 33",
  "34-38": "34 a 38", "39-43": "39 a 43", "44-48": "44 a 48", "49-53": "49 a 53",
  "54-58": "54 a 58", "59+": "59+",
};
// Mapeia acomodação da tabela de preços para o campo da proposta
const ACOMODACAO_PROPOSTA: Record<string, string> = {
  SEMI_PRIVATIVO: "ENFERMARIA", PRIVATIVO: "APARTAMENTO", SEM_ACOMODACAO: "ENFERMARIA",
};

interface ResultadoPlano {
  operadora: string; plano: string; acomodacao: string; coparticipacao: boolean;
  totalVidas: number; totalValor: number;
  detalhePorFaixa: { faixa: string; qtd: number; valorUnitario: number; subtotal: number }[];
}

async function getCotacao(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return null;
  return prisma.cotacao.findFirst({
    where: { id, organizationId: userDb.organizationId },
    include: { cliente: { select: { id: true, nome: true } } },
  });
}

export default async function CotacaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cotacao = await getCotacao(id);
  if (!cotacao) notFound();

  const vidas = cotacao.vidas as Record<string, number>;
  const resultado = (cotacao.resultado ?? []) as unknown as ResultadoPlano[];
  const totalVidas = Object.values(vidas).reduce((a, b) => a + (b || 0), 0);
  const menorValor = resultado.length > 0 ? resultado[0].totalValor : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/cotacoes" className="no-print">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{cotacao.nomeCliente}</h1>
          <p className="text-sm text-gray-500">
            {new Date(cotacao.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            {cotacao.cliente && (
              <> · <Link href={`/clientes/${cotacao.cliente.id}`} className="text-rose-500 hover:underline">{cotacao.cliente.nome}</Link></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{totalVidas} vida{totalVidas !== 1 ? "s" : ""}</span>
          </div>
          <ImprimirCotacao />
          <div className="no-print">
            <ExcluirCotacao cotacaoId={cotacao.id} />
          </div>
        </div>
      </div>

      {/* Detalhe das faixas */}
      <Card>
        <CardHeader><CardTitle className="text-base">Composição das vidas</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(vidas).filter(([, qtd]) => qtd > 0).map(([faixa, qtd]) => (
              <div key={faixa} className="bg-gray-50 border rounded-lg px-3 py-1.5 text-sm">
                <span className="text-gray-500">{FAIXAS_LABEL[faixa] ?? faixa} anos</span>
                <span className="ml-2 font-bold text-gray-900">{qtd}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Comparativo de planos</h2>
        {resultado.length === 0 ? (
          <p className="text-gray-500">Nenhum plano encontrado. Configure a tabela de preços em Configurações.</p>
        ) : (
          <div className="space-y-3">
            {resultado.map((r, i) => {
              const isMenor = menorValor !== null && r.totalValor === menorValor;
              const propostaParams = new URLSearchParams({
                operadora: r.operadora,
                plano: r.plano,
                acomodacao: ACOMODACAO_PROPOSTA[r.acomodacao] ?? "ENFERMARIA",
                coparticipacao: String(r.coparticipacao),
                valorSaude: r.totalValor.toFixed(2),
                quantasVidas: String(r.totalVidas),
                ...(cotacao.clienteId ? { clienteId: cotacao.clienteId } : {}),
              });

              return (
                <Card key={i} className={isMenor ? "border-green-300 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900">{r.operadora}</span>
                          <span className="text-gray-500">—</span>
                          <span className="text-gray-700">{r.plano}</span>
                          {isMenor && <Badge className="bg-green-600 text-white text-xs">Menor valor</Badge>}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{ACOMODACAO_LABEL[r.acomodacao] ?? r.acomodacao}</Badge>
                          <Badge variant="outline" className="text-xs">{r.coparticipacao ? "Com coparticipação" : "Sem coparticipação"}</Badge>
                          <Badge variant="outline" className="text-xs">{r.totalVidas} vida{r.totalVidas !== 1 ? "s" : ""}</Badge>
                        </div>
                        {r.detalhePorFaixa.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                            {r.detalhePorFaixa.map((d) => (
                              <div key={d.faixa} className="text-xs text-gray-500">
                                {FAIXAS_LABEL[d.faixa] ?? d.faixa} anos: {d.qtd}× R$ {d.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} = <span className="font-medium text-gray-700">R$ {d.subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total mensal</p>
                          <p className={`text-xl font-bold ${isMenor ? "text-green-700" : "text-gray-900"}`}>
                            R$ {r.totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-400">
                            R$ {(r.totalValor / r.totalVidas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/vida
                          </p>
                        </div>
                        <Link href={`/propostas/nova?${propostaParams}`} className="no-print">
                          <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                            <FileText className="h-3 w-3 mr-1" />
                            Usar este plano
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {cotacao.observacoes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-gray-700">{cotacao.observacoes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
