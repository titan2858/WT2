import { useEffect, useState } from "react";
import { Brain, Clock } from "lucide-react";

// ─── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const s = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  return (
    <div className={`${s} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin`} />
  );
}

// ─── Page Loader ───────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Brain className="h-10 w-10 text-brand-500 animate-pulse" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:     "badge-blue",
    in_progress: "badge-yellow",
    completed:   "badge-green",
    green:       "badge-green",
    yellow:      "badge-yellow",
    orange:      "badge-orange",
    red:         "badge-red",
  };
  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };
  return <span className={map[status] || "badge-blue"}>{labels[status] || status}</span>;
}

// ─── Test Timer ────────────────────────────────────────────────────────────
export function TestTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const pct = (remaining / seconds) * 100;
  const color = remaining <= 10 ? "bg-red-500" : remaining <= 20 ? "bg-yellow-400" : "bg-brand-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Clock className="h-4 w-4" />
        <span className={remaining <= 10 ? "text-red-600 font-bold" : ""}>{remaining}s</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-32">
        <div className={`h-full rounded-full progress-bar ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Test Progress Header ──────────────────────────────────────────────────
export function TestProgressHeader({ current, total, testName }) {
  const pct = ((current) / total) * 100;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">
          Test {current} of {total}
        </span>
        <span className="text-xs text-slate-400">{Math.round(pct)}% complete</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <h2 className="mt-4 text-2xl font-display font-bold text-slate-800">{testName}</h2>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-slate-300 mb-4" />}
      <h3 className="text-lg font-semibold text-slate-600">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  );
}

// ─── Score Color Helper ────────────────────────────────────────────────────
export function scoreColor(color) {
  return { green: "text-green-600", yellow: "text-yellow-600", orange: "text-orange-500", red: "text-red-600" }[color] || "text-slate-700";
}
export function scoreBg(color) {
  return { green: "bg-green-50 border-green-200", yellow: "bg-yellow-50 border-yellow-200", orange: "bg-orange-50 border-orange-200", red: "bg-red-50 border-red-200" }[color] || "bg-slate-50";
}
