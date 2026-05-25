import OpenAI from "openai";
import type { AIAnalysis, Rule, RiskLevel } from "@/types";
import {
  decisionFromRuleAction,
  findMatchingRule,
  statusFromDecision,
} from "./rules-engine";

const FALLBACK_ANALYSIS: AIAnalysis = {
  category: "geral",
  risk_level: "medium",
  intent: "consulta",
  suggested_decision: "review",
  reason: "Análise automática indisponível — enviado para revisão humana.",
  suggested_reply: null,
};

function buildRulesContext(rules: Rule[]): string {
  const active = rules.filter((r) => r.active);
  if (active.length === 0) return "Nenhuma regra cadastrada.";

  return active
    .map(
      (r) =>
        `- ${r.name}: palavras-chave [${r.keywords.join(", ")}] → ação ${r.action}${
          r.auto_reply ? ` | resposta: "${r.auto_reply}"` : ""
        }`
    )
    .join("\n");
}

export async function analyzeMessageWithAI(
  content: string,
  rules: Rule[]
): Promise<AIAnalysis> {
  const ruleMatch = findMatchingRule(content, rules);

  if (ruleMatch) {
    const decision = decisionFromRuleAction(ruleMatch.rule.action);
    return {
      category: "regra_aplicada",
      risk_level: ruleMatch.rule.action === "block" ? "high" : "low",
      intent: `Regra: ${ruleMatch.rule.name}`,
      suggested_decision: decision,
      reason: `Palavra-chave "${ruleMatch.matchedKeyword}" acionou a regra "${ruleMatch.rule.name}".`,
      suggested_reply: ruleMatch.rule.auto_reply,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return FALLBACK_ANALYSIS;
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Você é um analisador de mensagens WhatsApp para autorização empresarial.
Analise a mensagem e retorne APENAS JSON válido com:
- category: string (ex: suporte, vendas, spam, reclamação, saudação)
- risk_level: "low" | "medium" | "high"
- intent: string curta da intenção principal
- suggested_decision: "approve" | "block" | "review" | "reply"
- reason: justificativa curta em português
- suggested_reply: string ou null (resposta automática sugerida se decision for reply)

Regras cadastradas no sistema (considere na análise):
${buildRulesContext(rules)}

Critérios: spam/fraude/golpe → block; saudações simples → approve; reclamações sensíveis → review; perguntas rotineiras → reply com resposta útil.`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Mensagem:\n${content}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return FALLBACK_ANALYSIS;

    const parsed = JSON.parse(raw) as Partial<AIAnalysis>;
    const risk = ["low", "medium", "high"].includes(parsed.risk_level ?? "")
      ? (parsed.risk_level as RiskLevel)
      : "medium";

    const decision = ["approve", "block", "review", "reply"].includes(
      parsed.suggested_decision ?? ""
    )
      ? parsed.suggested_decision!
      : "review";

    return {
      category: parsed.category ?? "geral",
      risk_level: risk,
      intent: parsed.intent ?? "não identificada",
      suggested_decision: decision as AIAnalysis["suggested_decision"],
      reason: parsed.reason ?? "Análise concluída.",
      suggested_reply: parsed.suggested_reply ?? null,
    };
  } catch {
    return FALLBACK_ANALYSIS;
  }
}

export { statusFromDecision, findMatchingRule };
