"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { Rule, RuleAction } from "@/types";
import { ACTION_LABELS, formatDate } from "@/lib/utils";

const ACTIONS: RuleAction[] = ["approve", "block", "review", "reply"];

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    keywords: "",
    action: "review" as RuleAction,
    auto_reply: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  function loadRules() {
    fetch("/api/rules")
      .then((r) => r.json())
      .then((data) => setRules(data.rules ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", keywords: "", action: "review", auto_reply: "", active: true });
        setShowForm(false);
        loadRules();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rule: Rule) {
    await fetch(`/api/rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rule.active }),
    });
    loadRules();
  }

  async function deleteRule(id: string) {
    if (!confirm("Excluir esta regra?")) return;
    await fetch(`/api/rules/${id}`, { method: "DELETE" });
    loadRules();
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Motor de regras</h1>
          <p className="mt-1 text-slate-500">
            Cadastre palavras-chave e ações automáticas para autorização de mensagens
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Nova regra
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Cadastrar regra</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome da regra
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ex: Bloquear spam"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Palavras-chave (separadas por vírgula)
              </label>
              <input
                required
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="spam, golpe, promoção"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ação</label>
              <select
                value={form.action}
                onChange={(e) =>
                  setForm({ ...form, action: e.target.value as RuleAction })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {ACTION_LABELS[a]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Resposta automática (opcional)
              </label>
              <input
                value={form.auto_reply}
                onChange={(e) => setForm({ ...form, auto_reply: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Texto da resposta automática"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar regra"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando regras...</div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhuma regra cadastrada</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Nome</th>
                <th className="px-4 py-3 font-medium text-slate-600">Palavras-chave</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ação</th>
                <th className="px-4 py-3 font-medium text-slate-600">Resposta</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Criada em</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{rule.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{ACTION_LABELS[rule.action]}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                    {rule.auto_reply ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(rule)}
                      className="inline-flex items-center gap-1 text-sm"
                    >
                      {rule.active ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-emerald-600" />
                          <span className="text-emerald-700">Ativa</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-slate-400" />
                          <span className="text-slate-500">Inativa</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(rule.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
