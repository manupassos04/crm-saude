import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ClienteForm } from "@/components/clientes/ClienteForm";

async function getCliente(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) redirect("/login");

  return prisma.cliente.findFirst({
    where: { id, organizationId: userDb.organizationId },
    include: { dependentes: { orderBy: { criadoEm: "asc" } } },
  });
}

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  const clienteInicial = {
    ...cliente,
    dataNascimento: cliente.dataNascimento ? cliente.dataNascimento.toISOString().slice(0, 10) : null,
    dependentes: cliente.dependentes.map((d) => ({
      ...d,
      dataNascimento: d.dataNascimento,
      cpf: d.cpf ?? null,
      sexo: d.sexo ?? null,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clientes/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar cliente</h1>
      </div>
      <ClienteForm clienteInicial={clienteInicial} />
    </div>
  );
}
