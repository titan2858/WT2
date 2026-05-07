import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { patientsAPI, sessionsAPI } from "../../services/api";
import useAuthStore from "../../store/authStore";
import { Spinner, StatusBadge, EmptyState } from "../shared/UI";
import { Users, Plus, ClipboardList, X, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "../../store/langContext"; // IMPORT ADDED

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { t } = useLang(); // HOOK ADDED
  const navigate = useNavigate();
  const [tab, setTab] = useState("patients");
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAssignSession, setShowAssignSession] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", date_of_birth: "", gender: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([patientsAPI.list(), sessionsAPI.doctorAll()])
      .then(([p, s]) => { setPatients(p.data); setSessions(s.data); })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await patientsAPI.create(form);
      setPatients(prev => [data, ...prev]);
      setShowAddPatient(false);
      setForm({ name: "", email: "", password: "", date_of_birth: "", gender: "" });
      toast.success(`Patient ${data.name} added!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add patient");
    } finally { setSaving(false); }
  };

  const handleAssignSession = async (patientId) => {
    try {
      const { data } = await sessionsAPI.create({ patient_id: patientId });
      setSessions(prev => [data, ...prev]);
      setShowAssignSession(null);
      toast.success("Test session created! Patient can now start the assessment.");
    } catch (err) {
      toast.error("Failed to create session");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-800">{t("welcome_doctor")} {user?.name} 👋</h1>
        <p className="text-slate-500 mt-1">{t("manage_sub")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t("total_patients"), value: patients.length, color: "text-brand-600" },
          { label: t("sessions_completed"), value: sessions.filter(s => s.status === "completed").length, color: "text-green-600" },
          { label: t("pending_sessions"), value: sessions.filter(s => s.status !== "completed").length, color: "text-yellow-600" },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[["patients", t("patients_tab"), Users], ["sessions", t("sessions_tab"), ClipboardList]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${tab === id ? "bg-brand-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
        <button onClick={() => setShowAddPatient(true)}
          className="ml-auto btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t("add_patient")}
        </button>
      </div>

      {/* Patients Tab */}
      {tab === "patients" && (
        <div className="card p-0 overflow-hidden">
          {patients.length === 0 ? (
            <EmptyState icon={Users} title={t("no_patients")} description={t("no_patients_sub")} />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[t("col_name"), t("col_email"), t("col_gender"), t("col_dob"), t("col_actions")].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-5 py-3 text-slate-500">{p.email}</td>
                    <td className="px-5 py-3 text-slate-500 capitalize">{p.gender || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{p.date_of_birth || "—"}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setShowAssignSession(p)}
                        className="text-xs btn-secondary px-3 py-1.5">
                        {t("assign_test")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div className="card p-0 overflow-hidden">
          {sessions.length === 0 ? (
            <EmptyState icon={ClipboardList} title={t("no_sessions")} description={t("no_sessions_sub")} />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[t("col_patient"), t("col_status"), t("col_score"), t("col_date"), t("col_actions")].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800">{s.patient_name}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-slate-700 font-semibold">
                      {s.total_score !== null ? `${s.total_score} / 45` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {s.status === "completed" && (
                        <button onClick={() => navigate(`/results/${s.id}`)}
                          className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold">
                          <Eye className="h-3 w-3" /> {t("view_report")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-display font-bold">{t("add_patient_title")}</h3>
              <button onClick={() => setShowAddPatient(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddPatient} className="space-y-4">
              {[["name", t("name"), "text", "John Doe"], ["email", t("patient_email"), "email", "patient@email.com"], ["password", t("patient_password"), "password", "min 6 chars"]].map(([k, l, type, p]) => (
                <div key={k}>
                  <label className="label">{l}</label>
                  <input type={type} required className="input" placeholder={p}
                    value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t("dob")}</label>
                  <input type="date" className="input" value={form.date_of_birth}
                    onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
                </div>
                <div>
                  <label className="label">{t("gender")}</label>
                  <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select...</option>
                    {["Male", "Female", "Other", "Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2" disabled={saving}>
                {saving ? <Spinner size="sm" /> : t("add_patient")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Session Modal */}
      {showAssignSession && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm shadow-2xl animate-slide-up text-center">
            <h3 className="text-lg font-display font-bold mb-2">{t("assign_title")}</h3>
            <p className="text-slate-500 text-sm mb-6">
              {t("assign_confirm")} <strong>{showAssignSession.name}</strong>?<br/>
              {t("assign_sub")}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowAssignSession(null)} className="btn-secondary flex-1">{t("cancel")}</button>
              <button onClick={() => handleAssignSession(showAssignSession.id)} className="btn-primary flex-1">
                {t("create_session")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}