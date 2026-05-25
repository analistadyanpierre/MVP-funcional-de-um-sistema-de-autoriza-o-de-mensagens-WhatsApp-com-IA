export type MessageStatus =
  | "approved"
  | "blocked"
  | "pending"
  | "replied"
  | "auto_replied";

export type RuleAction = "approve" | "block" | "review" | "reply";

export type RiskLevel = "low" | "medium" | "high";

export interface Rule {
  id: string;
  name: string;
  keywords: string[];
  action: RuleAction;
  auto_reply: string | null;
  active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_name: string | null;
  sender_phone: string;
  content: string;
  ai_category: string | null;
  ai_risk_level: RiskLevel | null;
  ai_intent: string | null;
  ai_decision: string | null;
  ai_reason: string | null;
  suggested_reply: string | null;
  applied_rule_id: string | null;
  applied_rule_name: string | null;
  status: MessageStatus;
  created_at: string;
}

export interface MessageEvent {
  id: string;
  message_id: string;
  event_type: string;
  description: string | null;
  created_at: string;
}

export interface AIAnalysis {
  category: string;
  risk_level: RiskLevel;
  intent: string;
  suggested_decision: "approve" | "block" | "review" | "reply";
  reason: string;
  suggested_reply: string | null;
}

export interface DashboardStats {
  total: number;
  approved: number;
  blocked: number;
  pending: number;
}
