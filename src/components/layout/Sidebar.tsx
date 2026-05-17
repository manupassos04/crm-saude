"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FileText,
  Calculator,
  UsersRound,
  LayoutDashboard,
  Heart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navBase = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/cotacoes", label: "Cotações", icon: Calculator },
  { href: "/propostas", label: "Propostas", icon: FileText },
];

const navGerente = [
  { href: "/equipe", label: "Equipe", icon: UsersRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const navItems = role === "GERENTE" ? [...navBase, ...navGerente] : navBase;

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="font-bold text-lg text-gray-900">CRM Saúde</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-rose-50 text-rose-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
