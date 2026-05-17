import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { ClienteBusca } from "@/components/clientes/ClienteBusca";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";

async function getClientes(q?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return [];

  const where = q && q.trim()
    ? {
        organizationId: userDb.organizationId,
        OR: [
          { nome: { contains: q, mode: "insensitive" as const } },
          { cpf: { contains: q, mode: "insensitive" as const } },
          { cnpj: { contains: q, mode: "insensitive" as const } },
          { emailTitular: { contains: q, mode: "insensitive" as const } },
          { emailContato1: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { organizationId: userDb.organizationId };

  return prisma.cliente.findMany({
    where,
    orderBy: { criadoEm: "desc" },
  });
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clientes = await getClientes(q);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link href="/clientes/novo">
          <Button className="bg-rose-500 hover:bg-rose-600">
            <Plus className="h-4 w-4 mr-2" />
            Novo cliente
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <Suspense>
          <ClienteBusca />
        </Suspense>
      </div>

      <div className="bg-white rounded-lg border">
        <ClienteTable clientes={clientes} busca={q} />
      </div>
    </div>
  );
}
