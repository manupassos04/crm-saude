import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

async function getComissoes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return [];

  return prisma.proposta.findMany({
    where: { organizationId: userDb.organizationId, status: "APROVADA" },
    include: { cliente: { select: { nome: true } } },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function ComissoesPage() {
  const propostas = await getComissoes();

  const totalComissoes = propostas.reduce(
    (acc, p) => acc + Number(p.comissaoValor),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Comissões</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total em comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-600">
              R$ {totalComissoes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Propostas aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{propostas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Média por proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              R$ {propostas.length > 0
                ? (totalComissoes / propostas.length).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                : "0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border">
        {propostas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhuma proposta aprovada ainda. As comissões aparecem aqui quando uma proposta for marcada como <strong>Aprovada</strong>.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Operadora / Plano</TableHead>
                <TableHead>Valor mensal</TableHead>
                <TableHead>% Comissão</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Vigência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.cliente.nome}</TableCell>
                  <TableCell>{p.operadora} — {p.plano}</TableCell>
                  <TableCell>R$ {(Number(p.valorSaude) + Number(p.valorOdonto ?? 0) + Number(p.valorSOS ?? 0) + Number(p.valorAditivos ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{Number(p.comissaoPorc)}%</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-rose-600">
                    R$ {Number(p.comissaoValor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{new Date(p.dataVigencia).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
