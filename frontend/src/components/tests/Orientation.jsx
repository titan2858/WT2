import { useState, useCallback } from "react";
import { TestProgressHeader } from "../shared/UI";
import { useLang } from "../../store/langContext";

const now = new Date();

export default function Orientation({ onComplete, testIndex, totalTests }) {
  const { t } = useLang();
  const [answers, setAnswers] = useState({});
  const [started] = useState(Date.now());

  const QUESTIONS = [
    { id: "date",  label: t("orientation_q1"), type: "number", answer: now.getDate().toString(),          placeholder: "e.g. " + now.getDate() },
    { id: "day",   label: t("orientation_q2"), type: "select", answer: t("orientation_days")[now.getDay()],  options: t("orientation_days") },
    { id: "month", label: t("orientation_q3"), type: "select", answer: t("orientation_months")[now.getMonth()], options: t("orientation_months") },
    { id: "year",  label: t("orientation_q4"), type: "number", answer: now.getFullYear().toString(),       placeholder: "e.g. " + now.getFullYear() },
    { id: "city",  label: t("orientation_q5"), type: "text",   answer: null,                              placeholder: t("orientation_select") },
    { id: "place", label: t("orientation_q6"), type: "select", answer: null,                              options: t("orientation_places") },
  ];

  const set = (id, val) => setAnswers(a => ({ ...a, [id]: val }));
  const allAnswered = QUESTIONS.every(q => answers[q.id]?.toString().trim());

  const handleSubmit = useCallback(() => {
    const responses = QUESTIONS.map(q => {
      const given = answers[q.id]?.toString().toLowerCase().trim();
      const correct = q.answer ? given === q.answer.toLowerCase() : true;
      return { question: q.label, given: answers[q.id], correct };
    });
    const score = responses.filter(r => r.correct).length;
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({ score, maxScore: 6, timeTaken: time, responses });
  }, [answers, started, onComplete]);

  return (
    <div className="page-enter">
      <TestProgressHeader current={testIndex + 1} total={totalTests} testName={t("orientation_name")} />
      <div className="card max-w-lg mx-auto">
        <p className="text-slate-500 text-sm mb-6">{t("orientation_sub")}</p>
        <div className="space-y-5">
          {QUESTIONS.map((q, i) => (
            <div key={q.id}>
              <label className="label">{i + 1}. {q.label}</label>
              {q.type === "select" ? (
                <select className="input" value={answers[q.id] || ""} onChange={e => set(q.id, e.target.value)}>
                  <option value="">{t("orientation_select")}</option>
                  {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={q.type === "number" ? "number" : "text"} className="input"
                  placeholder={q.placeholder} value={answers[q.id] || ""}
                  onChange={e => set(q.id, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={!allAnswered}
          className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
          {t("orientation_submit")}
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">{t("orientation_hint")}</p>
    </div>
  );
}