import { STATUS_LABELS } from "@/lib/utils";

const styles: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  blocked: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
  replied: "bg-blue-100 text-blue-800",
  auto_replied: "bg-violet-100 text-violet-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
