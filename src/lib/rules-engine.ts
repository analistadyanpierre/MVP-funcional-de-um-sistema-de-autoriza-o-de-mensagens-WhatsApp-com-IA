import type { AIAnalysis, Rule, RuleAction } from "@/types";

export interface RuleMatch {
  rule: Rule;
  matchedKeyword: string;
}

export function findMatchingRule(
  content: string,
  rules: Rule[]
): RuleMatch | null {
  const normalized = content.toLowerCase();

  for (const rule of rules) {
    if (!rule.active) continue;

    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase().trim())) {
        return { rule, matchedKeyword: keyword };
      }
    }
  }

  return null;
}

export function decisionFromRuleAction(action: RuleAction): AIAnalysis["suggested_decision"] {
  return action;
}

export function statusFromDecision(
  decision: AIAnalysis["suggested_decision"]
): "approved" | "blocked" | "pending" | "auto_replied" {
  switch (decision) {
    case "approve":
      return "approved";
    case "block":
      return "blocked";
    case "reply":
      return "auto_replied";
    case "review":
    default:
      return "pending";
  }
}
