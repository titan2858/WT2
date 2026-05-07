import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionsAPI } from "../../services/api";
import useAuthStore from "../../store/authStore";
import { Spinner, StatusBadge, EmptyState } from "../shared/UI";
import { ClipboardList, Play, Eye, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "../../store/langContext"; // IMPORT ADDED

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const { t } = useLang(); // HOOK ADDED
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsAPI.mySessions()
      .then(r => setSessions(r.data))
      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (session) => {
    try {
      if (session.status === "pending") await sessionsAPI.start(session.id);
      navigate(`/test/${session.id}`);
    } catch (err) {
      toast.error("Failed to start session");
    }
  };

  const pending   = sessions.filter(s => s.status !== "completed");
  const completed = sessions.filter(s => s.status === "completed");

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-800">{t("hello_patient")} {user?.name} 👋</h1>
        <p className="text-slate-500 mt-1">{t("sessions_title")}</p>
      </div>

      {/* Pending Sessions */}
      <div className="mb-8">
        <h2 className="text-lg font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" /> {t("pending_title")}
        </h2>

        {pending.length === 0 ? (
          <div className="card text-center py-10">
            <EmptyState icon={ClipboardList}
              title={t("no_pending")}
              description={t("no_pending_sub")} />
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(s => (
              <div key={s.id} className="card flex items-center justify-between hover:border-brand-200 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800">Cognitive Assessment</p>
                  <p className="text-sm text-slate-500">
                    {t("assigned")} {new Date(s.created_at).toLocaleDateString()} · {t("eight_tests")}
                  </p>
                  <div className="mt-2"><StatusBadge status={s.status} /></div>
                </div>
                <button onClick={() => handleStart(s)}
                  className="btn-primary flex items-center gap-2 shrink-0">
                  <Play className="h-4 w-4" />
                  {s.status === "in_progress" ? t("continue_test") : t("start_test")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-green-500" /> {t("completed_title")}
          </h2>
          <div className="space-y-3">
            {completed.map(s => (
              <div key={s.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Cognitive Assessment</p>
                  <p className="text-sm text-slate-500">
                    {t("completed")} {new Date(s.completed_at || s.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status="completed" />
                    <span className="text-sm font-bold text-brand-700">{s.total_score} / 45</span>
                  </div>
                </div>
                <button onClick={() => navigate(`/results/${s.id}`)}
                  className="btn-secondary flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" /> {t("view_report")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}