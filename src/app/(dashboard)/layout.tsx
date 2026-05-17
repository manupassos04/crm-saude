import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function provisionarUsuario(email: string, metadata: Record<string, string>) {
  let userDb = await prisma.user.findUnique({ where: { email } });
  if (userDb) return userDb;

  const nomeCorretora = metadata.nome_corretora ?? "Minha Corretora";
  const nome = metadata.nome ?? email;

  const org = await prisma.organization.create({ data: { nome: nomeCorretora } });

  userDb = await prisma.user.create({
    data: { email, nome, role: "GERENTE", organizationId: org.id },
  });

  return userDb;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userDb = await provisionarUsuario(
    user.email!,
    (user.user_metadata ?? {}) as Record<string, string>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={userDb.role} />
      <div className="flex-1 flex flex-col">
        <Header userName={userDb.nome} role={userDb.role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
