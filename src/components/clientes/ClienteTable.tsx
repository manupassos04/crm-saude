"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  telefoneCelular1: string;
  emailTitular: string | null;
  cpf: string | null;
  cnpj: string | null;
  tipoPessoa: string;
}

export function ClienteTable({ clientes, busca }: { clientes: Cliente[]; busca?: string }) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {busca ? (
          <>Nenhum cliente encontrado para <strong>&quot;{busca}&quot;</strong>.</>
        ) : (
          <>
            Nenhum cliente cadastrado ainda.{" "}
            <Link href="/clientes/novo" className="text-rose-500 hover:underline">
              Cadastrar primeiro cliente
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF / CNPJ</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.nome}</TableCell>
            <TableCell>{c.tipoPessoa === "PJ" ? (c.cnpj ?? "—") : (c.cpf ?? "—")}</TableCell>
            <TableCell>{c.telefoneCelular1}</TableCell>
            <TableCell>{c.emailTitular ?? "—"}</TableCell>
            <TableCell>
              <Link href={`/clientes/${c.id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
