import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusSelect } from "@/components/propostas/StatusSelect";
import { ExcluirProposta } from "@/components/propostas/ExcluirProposta";

async function getPropostas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return [];

  return prisma.proposta.findMany({
    where: { organizationId: userDb.organizationId },
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function PropostasPage() {
  const propostas = await getPropostas();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
        <Link href="/propostas/nova">
          <Button className="bg-rose-500 hover:bg-rose-600">
            <Plus className="h-4 w-4 mr-2" />
            Nova proposta
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        {propostas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhuma proposta ainda.{" "}
            <Link href="/propostas/nova" className="text-rose-500 hover:underline">
              Criar primeira proposta
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Operadora / Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link href={`/clientes/${p.cliente.id}`} className="hover:text-rose-600 hover:underline">
                      {p.cliente.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{p.operadora} — {p.plano}</TableCell>
                  <TableCell>R$ {(Number(p.valorSaude) + Number(p.valorOdonto ?? 0) + Number(p.valorSOS ?? 0) + Number(p.valorAditivos ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-rose-600 font-medium">
                    R$ {Number(p.comissaoValor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{new Date(p.dataVigencia).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <StatusSelect propostaId={p.id} statusAtual={p.status} />
                  </TableCell>
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
  );
}
