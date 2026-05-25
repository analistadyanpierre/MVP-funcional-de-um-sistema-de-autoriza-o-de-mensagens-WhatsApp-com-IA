"use client";

import { useEffect, useState } from "react";
import { X, Check, Ban, Clock, Send } from "lucide-react";
import type { Message, MessageEvent } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, RISK_LABELS } from "@/lib/utils";

interface Props {
  messageId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function MessageDetailModal({ messageId, onClose, onUpdated }: Props) {
  const [message, setMessage] = useState<Message | null>(null);
  const [events, setEvents] = useState<MessageEvent[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!messageId) return;
    setLoading(true);
    fetch(`/api/messages/${messageId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessage(data.message);
        setEvents(data.events ?? []);
        setReplyText(data.message?.suggested_reply ?? "");
      })
      .finally(() => setLoading(false));
  }, [messageId]);

  if (!messageId) return null;

  async function runAction(action: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/messages/${messageId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reply_text: replyText }),
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
        const evRes = await fetch(`/api/messages/${messageId}`);
        const evData = await evRes.json();
        setEvents(evData.events ?? []);
        onUpdated();
      }
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Detalhe da mensagem</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : message ? (
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={message.status} />
              <span className="text-sm text-slate-500">{formatDate(message.created_at)}</span>
            </div>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Remetente
              </h3>
              <p className="mt-1 font-medium text-slate-900">
                {message.sender_name ?? "Sem nome"} — {message.sender_phone}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Conteúdo original
              </h3>
              <p className="mt-2 rounded-lg bg-slate-50 p-4 text-slate-800">{message.content}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Análise da IA</h3>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Categoria</dt>
                  <dd className="font-medium">{message.ai_category ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Risco</dt>
                  <dd className="font-medium">
                    {message.ai_risk_level
                      ? RISK_LABELS[message.ai_risk_level]
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Intenção</dt>
                  <dd className="font-medium">{message.ai_intent ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Decisão sugerida</dt>
                  <dd className="font-medium">{message.ai_decision ?? "—"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-slate-600">{message.ai_reason}</p>
              {message.applied_rule_name && (
                <p className="mt-2 text-sm text-emerald-700">
                  Regra aplicada: <strong>{message.applied_rule_name}</strong>
                </p>
              )}
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resposta automática sugerida
              </h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Edite a resposta antes de enviar..."
              />
            </section>

            <div className="flex flex-wrap gap-2">
              <button
                disabled={actionLoading}
                onClick={() => runAction("approve")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Aprovar
              </button>
              <button
                disabled={actionLoading}
                onClick={() => runAction("block")}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" /> Bloquear
              </button>
              <button
                disabled={actionLoading}
                onClick={() => runAction("pending")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Clock className="h-4 w-4" /> Pendente
              </button>
              <button
                disabled={actionLoading}
                onClick={() => runAction("reply")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Enviar resposta
              </button>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-slate-900">Histórico</h3>
              <ul className="mt-3 space-y-2">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex gap-3 border-l-2 border-emerald-200 pl-3 text-sm"
                  >
                    <span className="shrink-0 text-slate-400">
                      {formatDate(ev.created_at)}
                    </span>
                    <span className="text-slate-700">
                      <strong className="text-slate-900">{ev.event_type}</strong>
                      {ev.description && ` — ${ev.description}`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <div className="p-8 text-center text-red-600">Mensagem não encontrada</div>
        )}
      </div>
    </div>
  );
}
