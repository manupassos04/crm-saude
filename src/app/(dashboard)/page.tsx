import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente", APROVADA: "Aprovada", RECUSADA: "Recusada", CANCELADA: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-800",
  APROVADA: "bg-green-100 text-green-800",
  RECUSADA: "bg-red-100 text-red-800",
  CANCELADA: "bg-gray-100 text-gray-600",
};

async function getDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return null;

  const orgId = userDb.organizationId;
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const [totalClientes, propostasPendentes, propostasAprovadasMes, ultimasPropostas] = await Promise.all([
    prisma.cliente.count({ where: { organizationId: orgId } }),
    prisma.proposta.count({ where: { organizationId: orgId, status: "PENDENTE" } }),
    prisma.proposta.count({ where: { organizationId: orgId, status: "APROVADA", criadoEm: { gte: inicioMes } } }),
    prisma.proposta.findMany({
      where: { organizationId: orgId },
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { criadoEm: "desc" },
      take: 5,
    }),
  ]);

  return { totalClientes, propostasPendentes, propostasAprovadasMes, ultimasPropostas };
}

export default async function DashboardPage() {
  const dados = await getDashboardData();

  const cards = [
    { title: "Total de clientes", value: dados ? String(dados.totalClientes) : "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Propostas pendentes", value: dados ? String(dados.propostasPendentes) : "—", icon: FileText, color: "text-yellow-600", bg: "bg-yellow-50" },
    { title: "Aprovadas este mês", value: dados ? String(dados.propostasAprovadasMes) : "—", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Últimas propostas</CardTitle>
          <Link href="/propostas" className="text-sm text-rose-500 hover:underline">Ver todas</Link>
        </CardHeader>
        <CardContent className="p-0">
          {!dados || dados.ultimasPropostas.length === 0 ? (
            <p className="text-sm text-gray-500 px-6 py-4">Nenhuma proposta ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Operadora</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.ultimasPropostas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clientes/${p.cliente.id}`} className="hover:text-rose-600 hover:underline">
                        {p.cliente.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600">{p.operadora}</TableCell>
                    <TableCell>
                      R$ {(Number(p.valorSaude) + Number(p.valorOdonto ?? 0) + Number(p.valorSOS ?? 0) + Number(p.valorAditivos ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
