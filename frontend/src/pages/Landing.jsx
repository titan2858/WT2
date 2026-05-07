import { useNavigate } from "react-router-dom";
import { Brain, ShieldCheck, BarChart3, Users } from "lucide-react";
import { useLang } from "../store/langContext";
import LangSelector from "../components/shared/LangSelector";

const TEST_KEYS = [
  "serial_name","wordrecall_name","clock_name","trail_name",
  "orientation_name","digit_name","pattern_name","verbal_name",
];
const FEAT_KEYS = [
  { icon: Brain,       title: "feat_tests_title",   desc: "feat_tests_desc"   },
  { icon: BarChart3,   title: "feat_reports_title", desc: "feat_reports_desc" },
  { icon: Users,       title: "feat_portals_title", desc: "feat_portals_desc" },
  { icon: ShieldCheck, title: "feat_secure_title",  desc: "feat_secure_desc"  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50">
      {/* Top bar with lang selector */}
      <div className="flex justify-end px-6 pt-4">
        <LangSelector />
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 text-center animate-fade-in">
        <div className="inline-flex bg-brand-600 p-4 rounded-3xl mb-6 shadow-xl shadow-brand-200">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4 leading-tight">
          CogniCare
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
          {t("landing_tagline")}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => navigate("/signup")} className="btn-primary text-base px-8 py-3">
            {t("get_started")}
          </button>
          <button onClick={() => navigate("/login")} className="btn-secondary text-base px-8 py-3">
            {t("sign_in")}
          </button>
        </div>
      </div>

      {/* Test badges */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
          {t("tests_included")}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {TEST_KEYS.map((key, i) => (
            <span key={i} className="bg-white border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              {i + 1}. {t(key)}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEAT_KEYS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-brand-100 p-2.5 rounded-xl shrink-0">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-800 mb-1">{t(title)}</h3>
                  <p className="text-sm text-slate-500">{t(desc)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center pb-8 text-xs text-slate-400">
        {t("footer_note")}
      </footer>
    </div>
  );
}
