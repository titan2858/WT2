import { useState, useCallback } from "react";
import { TestTimer, TestProgressHeader } from "../shared/UI";
import { CheckCircle, XCircle } from "lucide-react";
import { useLang } from "../../store/langContext";

const SEQUENCE = [93, 86, 79, 72, 65]; // answers to 100-7 five times

export default function SerialSubtraction({ onComplete, testIndex, totalTests }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"
  const [started] = useState(Date.now());
  const [expired, setExpired] = useState(false);

  const submit = () => {
    if (!input.trim()) return;
    const val = parseInt(input.trim());
    const correct = val === SEQUENCE[step];
    const newAnswers = [...answers, { given: val, expected: SEQUENCE[step], correct }];
    setAnswers(newAnswers);
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      setInput("");
      if (step + 1 >= SEQUENCE.length) {
        finalize(newAnswers);
      } else {
        setStep(s => s + 1);
      }
    }, 800);
  };

  const finalize = useCallback((ans = answers) => {
    const score = ans.filter(a => a.correct).length;
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({ score, maxScore: 5, timeTaken: time, responses: ans });
  }, [answers, started, onComplete]);

  const handleExpire = useCallback(() => {
    setExpired(true);
    finalize();
  }, [finalize]);

  const currentNumber = step === 0 ? 100 : SEQUENCE[step - 1];

  return (
    <div className="page-enter">
      <TestProgressHeader current={testIndex + 1} total={totalTests} testName={t("serial_name")} />

      <div className="card max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">{t("serial_sub_label")}</p>
          <TestTimer seconds={60} onExpire={handleExpire} />
        </div>

        {expired ? (
          <p className="text-center text-slate-500 py-8">{t("serial_timeup")}</p>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-slate-500 mb-2 text-sm">{t("serial_what_is")}</p>
              <div className="text-6xl font-display font-bold text-brand-600 mb-2">{currentNumber}</div>
              <p className="text-slate-500 text-sm">{t("serial_minus")} <span className="font-bold text-slate-700">7</span>?</p>
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                className="input text-center text-2xl font-bold flex-1"
                placeholder="?"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                autoFocus
                disabled={!!feedback}
              />
              <button onClick={submit} className="btn-primary px-6" disabled={!!feedback || !input}>
                {t("serial_next")}
              </button>
            </div>

            {feedback && (
              <div className={`mt-4 flex items-center gap-2 justify-center font-semibold
                ${feedback === "correct" ? "text-green-600" : "text-red-500"}`}>
                {feedback === "correct" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {feedback === "correct" ? t("serial_correct") : `${t("serial_answer_was")} ${SEQUENCE[step]}`}
              </div>
            )}

            <div className="flex gap-2 justify-center mt-6">
              {SEQUENCE.map((_, i) => (
                <div key={i} className={`h-2 w-8 rounded-full transition-all ${
                  i < step ? "bg-brand-500" : i === step ? "bg-brand-300" : "bg-slate-200"
                }`} />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        {t("serial_hint")}
      </p>
    </div>
  );
}
