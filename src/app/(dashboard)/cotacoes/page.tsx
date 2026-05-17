import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExcluirCotacao } from "@/components/cotacoes/ExcluirCotacao";

async function getCotacoes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return [];
  return prisma.cotacao.findMany({
    where: { organizationId: userDb.organizationId },
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function CotacoesPage() {
  const cotacoes = await getCotacoes();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cotações</h1>
        <Link href="/cotacoes/nova">
          <Button className="bg-rose-500 hover:bg-rose-600">
            <Plus className="h-4 w-4 mr-2" />Nova cotação
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        {cotacoes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhuma cotação ainda.{" "}
            <Link href="/cotacoes/nova" className="text-rose-500 hover:underline">Criar primeira cotação</Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente vinculado</TableHead>
                <TableHead>Vidas</TableHead>
                <TableHead>Planos comparados</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotacoes.map((c) => {
                const vidas = c.vidas as Record<string, number>;
                const totalVidas = Object.values(vidas).reduce((a, b) => a + (b || 0), 0);
                const resultado = Array.isArray(c.resultado) ? c.resultado : [];
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nomeCliente}</TableCell>
                    <TableCell className="text-gray-500">
                      {c.cliente ? (
                        <Link href={`/clientes/${c.cliente.id}`} className="hover:text-rose-600 hover:underline">{c.cliente.nome}</Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{totalVidas}</TableCell>
                    <TableCell>{resultado.length} plano{resultado.length !== 1 ? "s" : ""}</TableCell>
                    <TableCell>{new Date(c.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/cotacoes/${c.id}`}>
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <ExcluirCotacao cotacaoId={c.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
