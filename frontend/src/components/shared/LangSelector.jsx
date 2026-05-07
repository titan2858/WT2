import { useLang } from "../../store/langContext";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "hi", label: "हिंदी",    flag: "🇮🇳" },
  { code: "mr", label: "मराठी",    flag: "🇮🇳" },
];

export default function LangSelector({ compact = false }) {
  const { lang, switchLang } = useLang();
  const current = LANGS.find(l => l.code === lang);

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-brand-400 transition-all text-sm font-medium text-slate-600 shadow-sm">
        <Globe className="h-3.5 w-3.5 text-brand-500" />
        <span>{current?.flag} {compact ? current?.code.toUpperCase() : current?.label}</span>
        <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
        {LANGS.map(l => (
          <button key={l.code} onClick={() => switchLang(l.code)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
              ${lang === l.code ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>
            <span className="text-base">{l.flag}</span>
            <span>{l.label}</span>
            {lang === l.code && <span className="ml-auto text-brand-500">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
