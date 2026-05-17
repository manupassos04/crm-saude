import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ConvidarVendedor } from "@/components/equipe/ConvidarVendedor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<string, string> = {
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

async function getDados() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb || userDb.role !== "GERENTE") return null;

  const equipe = await prisma.user.findMany({
    where: { organizationId: userDb.organizationId },
    orderBy: { criadoEm: "asc" },
  });

  return { equipe };
}

export default async function EquipePage() {
  const dados = await getDados();
  if (!dados) redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
      </div>

      <ConvidarVendedor />

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Desde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.equipe.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell className="text-gray-500">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "GERENTE" ? "default" : "secondary"}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
