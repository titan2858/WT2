import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain, Mail, Lock, User, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import useAuthStore from "../../store/authStore";
import { Spinner } from "../shared/UI";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "doctor" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.signup(form);
      login(data.user, data.access_token);
      toast.success(`Welcome to CogniCare, ${data.user.name}!`);
      navigate(data.user.role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex bg-brand-600 p-3 rounded-2xl mb-4 shadow-lg shadow-brand-200">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-1">Join CogniCare today</p>
        </div>

        <div className="card shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Toggle */}
            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "doctor", label: "Doctor", icon: Stethoscope },
                  { val: "patient", label: "Patient", icon: User },
                ].map(({ val, label, icon: Icon }) => (
                  <button key={val} type="button"
                    onClick={() => setForm(f => ({ ...f, role: val }))}
                    className={`flex items-center gap-2 justify-center p-3 rounded-xl border-2 transition-all font-semibold text-sm
                      ${form.role === val ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <Icon className="h-4 w-4" />{label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input required className="input pl-10" placeholder="Dr. John Smith"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" required className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="password" required className="input pl-10" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
