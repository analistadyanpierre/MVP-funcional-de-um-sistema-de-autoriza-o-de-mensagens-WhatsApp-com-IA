"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, CheckCircle, Ban, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Message } from "@/types";
import { formatDate } from "@/lib/utils";

interface Stats {
  total: number;
  approved: number;
  blocked: number;
  pending: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    blocked: 0,
    pending: 0,
  });
  const [recent, setRecent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.recent) setRecent(data.recent);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Visão geral das mensagens processadas pelo motor de IA e regras
        </p>
      </header>

      {loading ? (
        <p className="text-slate-500">Carregando estatísticas...</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total recebidas"
              value={stats.total}
              icon={MessageSquare}
            />
            <StatCard
              title="Aprovadas"
              value={stats.approved}
              icon={CheckCircle}
              accent="text-emerald-600"
            />
            <StatCard
              title="Bloqueadas"
              value={stats.blocked}
              icon={Ban}
              accent="text-red-600"
            />
            <StatCard
              title="Pendentes de revisão"
              value={stats.pending}
              icon={Clock}
              accent="text-amber-600"
            />
          </div>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Últimas mensagens processadas
              </h2>
              <Link
                href="/inbox"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Ver inbox completa →
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {recent.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Nenhuma mensagem ainda.{" "}
                  <Link href="/simulator" className="text-emerald-600 hover:underline">
                    Simule uma mensagem
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-600">Remetente</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Mensagem</th>
                      <th className="px-4 py-3 font-medium text-slate-600">IA</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recent.map((msg) => (
                      <tr key={msg.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">
                            {msg.sender_name ?? msg.sender_phone}
                          </p>
                          <p className="text-xs text-slate-500">{msg.sender_phone}</p>
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-700">
                          {msg.content}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {msg.ai_category ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={msg.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(msg.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
