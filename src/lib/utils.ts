export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export const STATUS_LABELS: Record<string, string> = {
  approved: "Aprovada",
  blocked: "Bloqueada",
  pending: "Pendente",
  replied: "Respondida",
  auto_replied: "Resposta automática",
};

export const ACTION_LABELS: Record<string, string> = {
  approve: "Aprovar",
  block: "Bloquear",
  review: "Revisar",
  reply: "Responder",
};

export const RISK_LABELS: Record<string, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};
