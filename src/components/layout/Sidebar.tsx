"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Shield,
  FlaskConical,
  MessageSquare,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/rules", label: "Regras", icon: Shield },
  { href: "/simulator", label: "Simulador", icon: FlaskConical },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">WhatsAuth IA</p>
          <p className="text-xs text-slate-500">Autorização de mensagens</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-500">MVP — WhatsApp + IA</p>
      </div>
    </aside>
  );
}
