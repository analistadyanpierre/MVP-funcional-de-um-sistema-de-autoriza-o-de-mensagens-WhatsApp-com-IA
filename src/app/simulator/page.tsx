"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import type { AIAnalysis, Message } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RISK_LABELS } from "@/lib/utils";

export default function SimulatorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    sender_name: "",
    sender_phone: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: Message;
    analysis: AIAnalysis;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/messages/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Simulador de mensagens</h1>
        <p className="mt-1 text-slate-500">
          Simule o recebimento de uma mensagem WhatsApp sem depender da API real
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Nova mensagem simulada</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome do remetente
              </label>
              <input
                value={form.sender_name}
                onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="João Silva"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Telefone *
              </label>
              <input
                required
                value={form.sender_phone}
                onChange={(e) => setForm({ ...form, sender_phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="5511999999999"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mensagem *
              </label>
              <textarea
                required
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Olá, gostaria de saber o horário de funcionamento..."
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              "Processando com IA..."
            ) : (
              <>
                <Send className="h-4 w-4" /> Processar mensagem
              </>
            )}
          </button>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <strong>Dicas de teste:</strong> tente &quot;olá&quot; (aprovar), &quot;ganhe
            dinheiro&quot; (bloquear), &quot;horário&quot; (responder) ou &quot;reclamação&quot;
            (revisar).
          </div>
        </form>

        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Resultado do processamento</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Status:</span>
                <StatusBadge status={result.message.status} />
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Categoria</dt>
                  <dd className="font-medium">{result.analysis.category}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Risco</dt>
                  <dd className="font-medium">
                    {RISK_LABELS[result.analysis.risk_level]}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Intenção</dt>
                  <dd className="font-medium">{result.analysis.intent}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Decisão sugerida</dt>
                  <dd className="font-medium">{result.analysis.suggested_decision}</dd>
                </div>
              </dl>

              <p className="text-sm text-slate-700">
                <strong>Justificativa:</strong> {result.analysis.reason}
              </p>

              {result.analysis.suggested_reply && (
                <div className="rounded-lg bg-white p-3 text-sm">
                  <strong className="text-slate-700">Resposta sugerida:</strong>
                  <p className="mt-1 text-slate-600">{result.analysis.suggested_reply}</p>
                </div>
              )}

              <button
                onClick={() => router.push("/inbox")}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Ver na inbox →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
