import { useState, useCallback } from "react";
import { TestProgressHeader, TestTimer } from "../shared/UI";
import { useLang } from "../../store/langContext";

export default function VerbalFluency({ onComplete, testIndex, totalTests }) {
  const { t } = useLang();
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [started] = useState(Date.now());

  const finalize = useCallback((text = input) => {
    if (submitted) return;
    setSubmitted(true);
    const words = text.toUpperCase().split(/[\s,\n]+/).filter(w => w.length > 0);
    const unique = [...new Set(words)];
    const count = unique.length;
    let score = 0;
    if (count >= 21) score = 5;
    else if (count >= 17) score = 4;
    else if (count >= 13) score = 3;
    else if (count >= 9)  score = 2;
    else if (count >= 5)  score = 1;
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({ score, maxScore: 5, timeTaken: time, responses: [{ words: unique, count }] });
  }, [input, submitted, started, onComplete]);

  return (
    <div className="page-enter">
      <TestProgressHeader current={testIndex + 1} total={totalTests} testName={t("verbal_name")} />

      <div className="card max-w-lg mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-700 mb-1">{t("verbal_instruction")}</h3>
            <p className="text-sm text-slate-500">{t("verbal_sub")}</p>
          </div>
          {!submitted && <TestTimer seconds={60} onExpire={finalize} />}
        </div>

        <textarea
          className="input min-h-[200px] resize-none text-base"
          placeholder={t("verbal_placeholder")}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={submitted}
          autoFocus
        />

        {/* Word count */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-slate-400">
            {input.split(/[\s,\n]+/).filter(w => w.trim()).length} {t("verbal_words_typed")}
          </span>
          <div className="flex gap-3 text-xs text-slate-400">
            <span>5+ = 1pt</span>
            <span>9+ = 2pt</span>
            <span>13+ = 3pt</span>
            <span>17+ = 4pt</span>
            <span>21+ = 5pt</span>
          </div>
        </div>

        {!submitted && (
          <button onClick={() => finalize()} className="btn-primary w-full mt-4" disabled={!input.trim()}>
            {t("verbal_submit_early")}
          </button>
        )}

        {submitted && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 font-semibold">
            {t("verbal_submitted")}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        {t("verbal_hint")}
      </p>
    </div>
  );
}