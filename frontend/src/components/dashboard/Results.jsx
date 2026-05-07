import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resultsAPI } from "../../services/api";
import { Spinner, scoreColor, scoreBg } from "../shared/UI";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Brain, Trophy, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "../../store/langContext";

const STATUS_ICON = { green: "🟢", yellow: "🟡", orange: "🟠", red: "🔴" };

export default function Results() {
  const { t } = useLang();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Note: Add these exact keys to your translations.js if you want the descriptions localized
  const TEST_DESCRIPTIONS = [
    t("Attention & Calculation"),
    t("Short-term Memory"),
    t("Visuospatial Ability"),
    t("Executive Function"),
    t("Memory & Awareness"),
    t("Working Memory"),
    t("Visual Memory"),
    t("Language & Memory"),
  ];

  useEffect(() => {
    resultsAPI.report(sessionId)
      .then(r => setReport(r.data))
      .catch(() => toast.error("Failed to load report"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Brain className="h-10 w-10 text-brand-400 mx-auto mb-3 animate-pulse" />
        <p className="text-slate-500">{t("saving")}</p>
      </div>
    </div>
  );

  if (!report) return (
    <div className="text-center py-20 text-slate-500">Report not found.</div>
  );

  const radarData = report.results.map((r) => ({
    subject: r.test_name.split(" ")[0],
    score: r.score,
    fullMark: r.max_score,
  }));

  const pct = report.percentage;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("results_back")}
      </button>

      {/* Hero score card */}
      <div className={`card border-2 mb-6 ${scoreBg(report.status_color)}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {t("results_title")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-800 mb-1">
              {report.patient_name}
            </h1>
            {report.completed_at && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                <Clock className="h-3 w-3" />
                {t("results_completed")} {new Date(report.completed_at).toLocaleString()}
              </p>
            )}
            <div className={`text-lg font-semibold ${scoreColor(report.status_color)}`}>
              {STATUS_ICON[report.status_color]}{" "}
              {report.status_color === "green" ? t("status_green") :
               report.status_color === "yellow" ? t("status_yellow") :
               report.status_color === "orange" ? t("status_orange") :
               t("status_red")}
            </div>
          </div>

          {/* Big score circle */}
          <div className="flex flex-col items-center">
            <div className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center border-4
              ${report.status_color === "green"  ? "border-green-400 bg-green-50" :
                report.status_color === "yellow" ? "border-yellow-400 bg-yellow-50" :
                report.status_color === "orange" ? "border-orange-400 bg-orange-50" :
                "border-red-400 bg-red-50"}`}
            >
              <span className={`text-3xl font-display font-bold ${scoreColor(report.status_color)}`}>
                {report.total_score}
              </span>
              <span className="text-xs text-slate-400">{t("results_out_of")}</span>
            </div>
            <p className="text-sm text-slate-500 mt-2 font-semibold">{pct}%</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-5">
          <div className="h-3 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000
                ${report.status_color === "green"  ? "bg-green-500" :
                  report.status_color === "yellow" ? "bg-yellow-400" :
                  report.status_color === "orange" ? "bg-orange-400" : "bg-red-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>45</span>
          </div>
        </div>
      </div>

      {/* Radar chart */}
      {radarData.length >= 3 && (
        <div className="card mb-6">
          <h2 className="text-lg font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-500" /> {t("results_domain")}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-test breakdown */}
      <div className="card">
        <h2 className="text-lg font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" /> {t("results_breakdown")}
        </h2>
        <div className="space-y-4">
          {report.results.map((r, i) => {
            const testPct = Math.round((r.score / r.max_score) * 100);
            const barColor =
              testPct >= 80 ? "bg-green-500" :
              testPct >= 50 ? "bg-yellow-400" : "bg-red-400";
            return (
              <div key={r.id || i}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.test_name}</p>
                    <p className="text-xs text-slate-400">{TEST_DESCRIPTIONS[r.test_index] || ""}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="font-bold text-slate-700">{r.score}</span>
                    <span className="text-slate-400 text-sm"> / {r.max_score}</span>
                    {r.doctor_review_required && r.score === 0 && (
                      <div className="text-xs text-amber-600 font-semibold">
                        {t("results_pending_review")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${testPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>⏱ {r.time_taken_seconds}s</span>
                  <span>{testPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-400 mt-6 px-4">
        {t("results_disclaimer")}
      </p>
    </div>
  );
}