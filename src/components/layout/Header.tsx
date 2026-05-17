"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

interface HeaderProps {
  userName?: string;
  role?: string;
}

export function Header({ userName = "Usuário", role }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-end px-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700 leading-tight">{userName}</p>
            {role && (
              <p className="text-xs text-gray-400 leading-tight">{ROLE_LABEL[role] ?? role}</p>
            )}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-rose-100 text-rose-600 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
