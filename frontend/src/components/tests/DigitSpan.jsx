import { useState, useEffect, useCallback } from "react";
import { TestProgressHeader } from "../shared/UI";
import { CheckCircle, XCircle } from "lucide-react";
import { useLang } from "../../store/langContext";

function genDigits(len) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 9) + 1);
}

export default function DigitSpan({ onComplete, testIndex, totalTests }) {
  const { t } = useLang();
  const [phase, setPhase] = useState("forward"); // forward | backward
  const [spanLen, setSpanLen] = useState(3);
  const [digits, setDigits] = useState(() => genDigits(3));
  const [input, setInput] = useState("");
  const [fails, setFails] = useState(0);
  const [forwardBest, setForwardBest] = useState(0);
  const [backwardBest, setBackwardBest] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [started] = useState(Date.now());
  const [currentDigitIdx, setCurrentDigitIdx] = useState(0);
  const [showing, setShowing] = useState(true);

  // Show digits one by one
  useEffect(() => {
    if (!showing) return;
    if (currentDigitIdx >= digits.length) {
      setTimeout(() => { setShowing(false); setInput(""); }, 600);
      return;
    }
    const timer = setTimeout(() => setCurrentDigitIdx(i => i + 1), 900);
    return () => clearTimeout(timer);
  }, [showing, currentDigitIdx, digits.length]);

  const startRound = (len) => {
    const d = genDigits(len);
    setDigits(d);
    setCurrentDigitIdx(0);
    setShowing(true);
    setInput("");
    setFeedback(null);
  };

  const finalize = useCallback((fb, bb) => {
    const score = Math.min(5, Math.round(((fb - 2) + (bb - 2)) / 2));
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({
      score: Math.max(0, score),
      maxScore: 5,
      timeTaken: time,
      responses: [{ forwardBest: fb, backwardBest: bb }],
    });
  }, [started, onComplete]);

  const handleSubmit = () => {
    const typed = input.trim().split("").filter(c => /\d/.test(c)).map(Number);
    const expected = phase === "backward" ? [...digits].reverse() : digits;
    const correct = typed.length === expected.length && typed.every((d, i) => d === expected[i]);

    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      if (correct) {
        if (phase === "forward") setForwardBest(spanLen);
        else setBackwardBest(spanLen);
        const newLen = spanLen + 1;
        if (newLen > 7) {
          if (phase === "forward") {
            setPhase("backward");
            setSpanLen(3);
            setFails(0);
            startRound(3);
          } else {
            finalize(forwardBest, spanLen);
          }
        } else {
          setSpanLen(newLen);
          startRound(newLen);
          setFails(0);
        }
      } else {
        const newFails = fails + 1;
        setFails(newFails);
        if (newFails >= 2) {
          if (phase === "forward") {
            setPhase("backward");
            setSpanLen(3);
            setFails(0);
            startRound(3);
          } else {
            finalize(forwardBest, backwardBest);
          }
        } else {
          startRound(spanLen);
        }
      }
    }, 1000);
  };

  return (
    <div className="page-enter">
      <TestProgressHeader current={testIndex + 1} total={totalTests} testName={t("digit_name")} />

      <div className="card max-w-lg mx-auto text-center">
        <div className="flex gap-2 justify-center mb-6">
          {["forward", "backward"].map(p => (
            <span
              key={p}
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                phase === p ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {p === "forward" ? t("digit_type_same") : t("digit_type_reverse")}
            </span>
          ))}
        </div>

        <p className="text-slate-500 text-sm mb-6">
          {phase === "forward" ? t("digit_forward_inst") : t("digit_backward_inst")}
        </p>

        {showing ? (
          <div className="py-10">
            <p className="text-xs text-slate-400 mb-4">{t("digit_memorize")}</p>
            <div className="flex gap-3 justify-center">
              {digits.map((d, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300
                    ${i < currentDigitIdx
                      ? "bg-brand-600 text-white shadow-lg scale-110"
                      : "bg-slate-100 text-slate-300"
                    }`}
                >
                  {i < currentDigitIdx ? d : "?"}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <p className="text-sm text-slate-600 font-medium">
              {phase === "backward" ? t("digit_type_reverse") : t("digit_type_same")}
            </p>
            <input
              className="input text-center text-2xl font-bold tracking-widest"
              placeholder="e.g. 4 7 2"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
              disabled={!!feedback}
            />
            <button
              onClick={handleSubmit}
              className="btn-primary w-full"
              disabled={!input.trim() || !!feedback}
            >
              {t("digit_submit")}
            </button>
            {feedback && (
              <div className={`flex items-center justify-center gap-2 font-semibold ${
                feedback === "correct" ? "text-green-600" : "text-red-500"
              }`}>
                {feedback === "correct"
                  ? <CheckCircle className="h-5 w-5" />
                  : <XCircle className="h-5 w-5" />}
                {feedback === "correct"
                  ? t("digit_correct")
                  : `${t("digit_expected")} ${(phase === "backward" ? [...digits].reverse() : digits).join(" ")}`}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-slate-400 mt-2">
          {t("digit_span_len")} {spanLen} {t("digit_digits")}
        </div>
      </div>
    </div>
  );
}