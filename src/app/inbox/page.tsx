"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MessageDetailModal } from "@/components/messages/MessageDetailModal";
import type { Message } from "@/types";
import { formatDate } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovadas" },
  { value: "blocked", label: "Bloqueadas" },
  { value: "replied", label: "Respondidas" },
  { value: "auto_replied", label: "Auto-resposta" },
];

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadMessages = useCallback(() => {
    setLoading(true);
    const url = filter ? `/api/messages?status=${filter}` : "/api/messages";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Inbox de mensagens</h1>
        <p className="mt-1 text-slate-500">
          Todas as mensagens recebidas e seu status de autorização
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhuma mensagem encontrada</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Remetente</th>
                <th className="px-4 py-3 font-medium text-slate-600">Conteúdo</th>
                <th className="px-4 py-3 font-medium text-slate-600">Data</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Classificação IA</th>
                <th className="px-4 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {msg.sender_name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500">{msg.sender_phone}</p>
                  </td>
                  <td className="max-w-md truncate px-4 py-3 text-slate-700">
                    {msg.content}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(msg.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={msg.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700">{msg.ai_category ?? "—"}</span>
                    {msg.ai_risk_level && (
                      <span className="ml-2 text-xs text-slate-400">
                        ({msg.ai_risk_level})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedId(msg.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                    >
                      <Eye className="h-4 w-4" /> Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MessageDetailModal
        messageId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={loadMessages}
      />
    </div>
  );
}
