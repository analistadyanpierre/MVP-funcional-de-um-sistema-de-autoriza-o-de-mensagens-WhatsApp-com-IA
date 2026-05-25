import { analyzeMessageWithAI, findMatchingRule, statusFromDecision } from "./ai-analyze";
import { createServerClient } from "./supabase/server";
import type { AIAnalysis, Message, Rule } from "@/types";

export interface ProcessMessageInput {
  sender_name?: string;
  sender_phone: string;
  content: string;
  source?: "simulator" | "whatsapp";
}

export interface ProcessMessageResult {
  message: Message;
  analysis: AIAnalysis;
}

async function logEvent(
  supabase: ReturnType<typeof createServerClient>,
  messageId: string,
  eventType: string,
  description: string
) {
  await supabase.from("message_events").insert({
    message_id: messageId,
    event_type: eventType,
    description,
  });
}

export async function processIncomingMessage(
  input: ProcessMessageInput
): Promise<ProcessMessageResult> {
  const supabase = createServerClient();

  const { data: rules } = await supabase
    .from("rules")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  const activeRules = (rules ?? []) as Rule[];
  const analysis = await analyzeMessageWithAI(input.content, activeRules);
  const ruleMatch = findMatchingRule(input.content, activeRules);
  const status = statusFromDecision(analysis.suggested_decision);

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_name: input.sender_name ?? null,
      sender_phone: input.sender_phone,
      content: input.content,
      ai_category: analysis.category,
      ai_risk_level: analysis.risk_level,
      ai_intent: analysis.intent,
      ai_decision: analysis.suggested_decision,
      ai_reason: analysis.reason,
      suggested_reply: analysis.suggested_reply,
      applied_rule_id: ruleMatch?.rule.id ?? null,
      applied_rule_name: ruleMatch?.rule.name ?? null,
      status,
    })
    .select()
    .single();

  if (error || !message) {
    throw new Error(error?.message ?? "Falha ao salvar mensagem");
  }

  await logEvent(
    supabase,
    message.id,
    "received",
    `Mensagem recebida via ${input.source ?? "unknown"}`
  );

  await logEvent(
    supabase,
    message.id,
    "ai_analyzed",
    `IA: ${analysis.category} | risco ${analysis.risk_level} | decisão ${analysis.suggested_decision}`
  );

  if (ruleMatch) {
    await logEvent(
      supabase,
      message.id,
      "rule_applied",
      `Regra "${ruleMatch.rule.name}" (palavra: ${ruleMatch.matchedKeyword})`
    );
  }

  if (status !== "pending") {
    await logEvent(
      supabase,
      message.id,
      "auto_decision",
      `Status definido automaticamente: ${status}`
    );
  }

  return { message: message as Message, analysis };
}
