import { Brain, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import LangSelector from "./LangSelector";
import { useLang } from "../../store/langContext";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
          <div className="bg-brand-600 p-1.5 rounded-xl group-hover:bg-brand-700 transition-colors">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-800">CogniCare</span>
        </button>

        <div className="flex items-center gap-3">
          <LangSelector />
          {user && (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="bg-brand-100 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{t(user.role)}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
