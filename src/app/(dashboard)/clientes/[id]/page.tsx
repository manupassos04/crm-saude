import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { StatusSelect } from "@/components/propostas/StatusSelect";
import { ExcluirCliente } from "@/components/clientes/ExcluirCliente";
import { ExcluirProposta } from "@/components/propostas/ExcluirProposta";

const PARENTESCO_LABEL: Record<string, string> = {
  CONJUGE: "Cônjuge", FILHO: "Filho", FILHA: "Filha", PAI: "Pai",
  MAE: "Mãe", IRMAO: "Irmão", IRMA: "Irmã", OUTRO: "Outro",
};
const ESTADO_CIVIL_LABEL: Record<string, string> = {
  SOLTEIRO: "Solteiro(a)", CASADO: "Casado(a)", DIVORCIADO: "Divorciado(a)",
  VIUVO: "Viúvo(a)", UNIAO_ESTAVEL: "União estável",
};
const TIPO_PLANO_LABEL: Record<string, string> = {
  INDIVIDUAL: "Individual", FAMILIAR: "Familiar",
  EMPRESARIAL: "Empresarial", COLETIVO_ADESAO: "Coletivo por adesão",
};

async function getCliente(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return null;

  return prisma.cliente.findFirst({
    where: { id, organizationId: userDb.organizationId },
    include: {
      dependentes: { orderBy: { criadoEm: "asc" } },
      propostas: { orderBy: { criadoEm: "desc" } },
    },
  });
}

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  const totalComissoes = cliente.propostas
    .filter((p) => p.status === "APROVADA")
    .reduce((acc, p) => acc + Number(p.comissaoValor), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/clientes">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{cliente.nome}</h1>
        <div className="flex gap-2">
          <Link href={`/clientes/${id}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </Link>
          <ExcluirCliente clienteId={id} nomeCliente={cliente.nome} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["CPF", cliente.cpf],
              ["CNPJ", cliente.cnpj],
              ["Razão social", cliente.razaoSocial],
              ["Nascimento", cliente.dataNascimento ? new Date(cliente.dataNascimento).toLocaleDateString("pt-BR") : null],
              ["Sexo", cliente.sexo === "MASCULINO" ? "Masculino" : cliente.sexo === "FEMININO" ? "Feminino" : null],
              ["Estado civil", cliente.estadoCivil ? ESTADO_CIVIL_LABEL[cliente.estadoCivil] : null],
              ["Profissão", cliente.profissao],
              ["Celular 1", cliente.telefoneCelular1],
              ["Celular 2", cliente.telefoneCelular2],
              ["Telefone fixo", cliente.telefoneFix],
              ["E-mail titular", cliente.emailTitular],
              ["E-mail contato 1", cliente.emailContato1],
              ["E-mail contato 2", cliente.emailContato2],
              ["CEP", cliente.cep],
              ["Endereço", cliente.logradouro ? `${cliente.logradouro}${cliente.numero ? `, ${cliente.numero}` : ""}${cliente.complemento ? ` — ${cliente.complemento}` : ""}` : null],
              ["Bairro", cliente.bairro],
              ["Cidade / UF", cliente.cidade ? `${cliente.cidade}${cliente.uf ? ` — ${cliente.uf}` : ""}` : null],
              ["Preferência de atendimento", cliente.cidadePreferencia],
            ].filter(([, v]) => v).map(([label, valor]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="text-right">{valor}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tipo</span>
              <span>{cliente.tipoPessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dependentes</span>
              <span className="font-medium">{cliente.dependentes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total de propostas</span>
              <span className="font-medium">{cliente.propostas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Propostas aprovadas</span>
              <span className="font-medium">{cliente.propostas.filter((p) => p.status === "APROVADA").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Comissões geradas</span>
              <span className="font-bold text-rose-600">
                R$ {totalComissoes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dependentes */}
      {cliente.dependentes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Dependentes</h2>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>CPF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cliente.dependentes.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.nome}</TableCell>
                    <TableCell><Badge variant="outline">{PARENTESCO_LABEL[d.parentesco] ?? d.parentesco}</Badge></TableCell>
                    <TableCell>{new Date(d.dataNascimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{d.cpf ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Propostas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Propostas</h2>
          <Link href={`/propostas/nova?clienteId=${cliente.id}`}>
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
              <Plus className="h-4 w-4 mr-1" />Nova proposta
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg border">
          {cliente.propostas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma proposta.{" "}
              <Link href={`/propostas/nova?clienteId=${cliente.id}`} className="text-rose-500 hover:underline">
                Criar proposta
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operadora / Plano</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cliente.propostas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.operadora} — {p.plano}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{TIPO_PLANO_LABEL[p.tipoPlano] ?? p.tipoPlano}</TableCell>
                    <TableCell>R$ {(Number(p.valorSaude) + Number(p.valorOdonto ?? 0) + Number(p.valorSOS ?? 0) + Number(p.valorAditivos ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-rose-600 font-medium">
                      R$ {Number(p.comissaoValor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{new Date(p.dataVigencia).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><StatusSelect propostaId={p.id} statusAtual={p.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/propostas/${p.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <ExcluirProposta propostaId={p.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
