import { useState, useEffect, useCallback } from "react";
import { TestProgressHeader } from "../shared/UI";
import { useLang } from "../../store/langContext";

const ROUNDS = [
  { highlight: 3 },
  { highlight: 5 },
  { highlight: 7 },
];

function randomCells(count, total = 16) {
  const all = Array.from({ length: total }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

export default function PatternRecognition({ onComplete, testIndex, totalTests }) {
  const { t } = useLang();

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("show");
  const [pattern, setPattern] = useState(() => randomCells(ROUNDS[0].highlight));
  const [selected, setSelected] = useState([]);
  const [roundScores, setRoundScores] = useState([]);
  const [started] = useState(Date.now());
  const SHOW_MS = 4000;

  useEffect(() => {
    if (phase !== "show") return;
    const tmr = setTimeout(() => setPhase("recall"), SHOW_MS);
    return () => clearTimeout(tmr);
  }, [phase, round]);

  const toggleCell = (i) => {
    if (phase !== "recall") return;
    setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  };

  const handleSubmit = useCallback(() => {
    const correct = selected.filter(i => pattern.includes(i)).length;
    const newScores = [...roundScores, correct];
    setRoundScores(newScores);

    if (round + 1 >= ROUNDS.length) {
      const totalCorrect = newScores.reduce((a, b) => a + b, 0);
      const totalPossible = ROUNDS.reduce((a, r) => a + r.highlight, 0);
      const score = Math.round((totalCorrect / totalPossible) * 5);
      const time = Math.round((Date.now() - started) / 1000);

      const responses = newScores.map((correct, i) => ({
        round: i + 1,
        correct,
        possible: ROUNDS[i].highlight,
      }));

      onComplete({ score, maxScore: 5, timeTaken: time, responses });
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      setPattern(randomCells(ROUNDS[nextRound].highlight));
      setSelected([]);
      setPhase("show");
    }
  }, [selected, pattern, roundScores, round, started, onComplete]);

  return (
    <div className="page-enter">
      <TestProgressHeader
        current={testIndex + 1}
        total={totalTests}
        testName={t("pattern_name")}
      />

      <div className="card max-w-lg mx-auto text-center">
        <div className="flex gap-2 justify-center mb-4">
          {ROUNDS.map((_, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${
              i === round ? "bg-brand-600 text-white" :
              i < round ? "bg-green-100 text-green-700" :
              "bg-slate-100 text-slate-400"
            }`}>
              {t(`pattern_round_${i+1}`)}
            </span>
          ))}
        </div>

        {phase === "show" ? (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {t("pattern_memorize")} {SHOW_MS / 1000}s.
            </p>

            <div className="grid grid-cols-4 gap-2 w-64 mx-auto">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className={`h-14 rounded-xl ${
                  pattern.includes(i)
                    ? "bg-brand-500 shadow-lg"
                    : "bg-slate-100"
                }`} />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {t("pattern_click")}
              <span className="font-semibold text-brand-600">
                ({ROUNDS[round].highlight} {t("pattern_squares")})
              </span>
            </p>

            <div className="grid grid-cols-4 gap-2 w-64 mx-auto mb-6">
              {Array.from({ length: 16 }, (_, i) => (
                <button key={i}
                  onClick={() => toggleCell(i)}
                  className={`h-14 rounded-xl ${
                    selected.includes(i)
                      ? "bg-brand-500"
                      : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {selected.length} {t("pattern_of")} {ROUNDS[round].highlight}
            </p>

            <button onClick={handleSubmit} className="btn-primary">
              {round + 1 < ROUNDS.length
                ? t("pattern_next")
                : t("pattern_finish")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}