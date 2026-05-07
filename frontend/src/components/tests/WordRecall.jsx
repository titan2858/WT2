import { useState, useEffect, useCallback, useRef } from "react";
import { TestProgressHeader } from "../shared/UI";
import { Volume2, VolumeX } from "lucide-react";
import { useLang } from "../../store/langContext";

const WORDS_BY_LANG = {
  en: ["APPLE", "TABLE", "RIVER", "PENCIL", "CLOUD"],
  hi: ["सेब", "मेज़", "नदी", "पेंसिल", "बादल"],
  mr: ["सफरचंद", "टेबल", "नदी", "पेन्सिल", "ढग"],
};
const SHOW_MS = 2500;

// TTS helper — uses browser Web Speech API
function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-US";
  utter.rate = 0.85;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function stopSpeak() {
  window.speechSynthesis?.cancel();
}

export default function WordRecall({ onComplete, testIndex, totalTests }) {
  const { t, lang } = useLang();
  const WORDS = WORDS_BY_LANG[lang] || WORDS_BY_LANG.en;

  const [phase, setPhase] = useState("encoding");
  const [wordIdx, setWordIdx] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [recalled, setRecalled] = useState("");
  const [started] = useState(Date.now());
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Encoding phase — show + optionally speak each word
  useEffect(() => {
    if (phase !== "encoding") return;
    if (wordIdx >= WORDS.length) {
      stopSpeak();
      setPhase("distractor");
      return;
    }
    // Speak the current word if TTS enabled
    if (ttsEnabled) {
      setIsSpeaking(true);
      speak(WORDS[wordIdx], lang);
      const speakDone = setTimeout(() => setIsSpeaking(false), 1200);
      return () => clearTimeout(speakDone);
    }
  }, [phase, wordIdx, ttsEnabled, lang, WORDS]);

  useEffect(() => {
    if (phase !== "encoding") return;
    if (wordIdx >= WORDS.length) return;
    const t = setTimeout(() => setWordIdx(i => i + 1), SHOW_MS);
    return () => clearTimeout(t);
  }, [phase, wordIdx, WORDS.length]);

  // Distractor countdown
  useEffect(() => {
    if (phase !== "distractor") return;
    if (countdown <= 0) { setPhase("recall"); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const handleSubmit = useCallback(() => {
    const typed = recalled.toUpperCase().split(/[\s,]+/).filter(Boolean);
    const WORDS_UPPER = WORDS.map(w => w.toUpperCase());
    const score = typed.filter(w => WORDS_UPPER.includes(w)).length;
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({ score, maxScore: 5, timeTaken: time, responses: [{ recalled: typed, correct: WORDS }] });
  }, [recalled, started, onComplete, WORDS]);

  const toggleTTS = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    if (!next) stopSpeak();
  };

  return (
    <div className="page-enter">
      <TestProgressHeader current={testIndex + 1} total={totalTests} testName={t("wordrecall_name")} />

      <div className="card max-w-lg mx-auto text-center">

        {/* TTS Toggle — only show during encoding phase */}
        {phase === "encoding" && (
          <div className="flex justify-end mb-2">
            <button onClick={toggleTTS}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
                ${ttsEnabled
                  ? "bg-brand-600 text-white border-brand-600 shadow"
                  : "bg-white text-slate-500 border-slate-200 hover:border-brand-400"}`}>
              {ttsEnabled
                ? <><Volume2 className="h-3.5 w-3.5" /> {t("wordrecall_speak_stop")}</>
                : <><VolumeX className="h-3.5 w-3.5" /> {t("wordrecall_speak")}</>}
            </button>
          </div>
        )}

        {phase === "encoding" && (
          <>
            <p className="text-slate-500 mb-8 text-sm">{t("wordrecall_instruction")}</p>
            {wordIdx < WORDS.length ? (
              <div className="py-12">
                <div className={`text-5xl font-display font-bold text-brand-600 animate-fade-in mb-4 ${isSpeaking ? "scale-110 transition-transform" : ""}`}>
                  {WORDS[wordIdx]}
                </div>
                {ttsEnabled && (
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    <Volume2 className="h-4 w-4 text-brand-400 animate-pulse" />
                    <span className="text-xs text-brand-500 font-medium">Reading aloud...</span>
                  </div>
                )}
                <div className="flex gap-2 justify-center mt-4">
                  {WORDS.map((_, i) => (
                    <div key={i} className={`h-2 w-8 rounded-full ${i <= wordIdx ? "bg-brand-500" : "bg-slate-200"}`} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-12 text-slate-500">{t("wordrecall_all_shown")}</p>
            )}
          </>
        )}

        {phase === "distractor" && (
          <>
            <p className="text-slate-500 mb-4 text-sm">{t("wordrecall_distractor")}</p>
            <div className="text-8xl font-display font-bold text-slate-700 py-10 animate-pulse-soft">
              {countdown}
            </div>
            <p className="text-xs text-slate-400">{t("wordrecall_distractor_sub")}</p>
          </>
        )}

        {phase === "recall" && (
          <>
            <p className="text-lg font-semibold text-slate-700 mb-2">{t("wordrecall_recall_title")}</p>
            <p className="text-slate-500 text-sm mb-6">{t("wordrecall_recall_sub")}</p>
            <textarea
              className="input min-h-[100px] resize-none text-center text-lg"
              placeholder={t("wordrecall_placeholder")}
              value={recalled}
              onChange={e => setRecalled(e.target.value)}
              autoFocus
            />
            <button onClick={handleSubmit} className="btn-primary w-full mt-4">
              {t("wordrecall_submit")}
            </button>
          </>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        {phase === "encoding" && t("wordrecall_hint_encode")}
        {phase === "distractor" && t("wordrecall_hint_distractor")}
        {phase === "recall" && t("wordrecall_hint_recall")}
      </p>
    </div>
  );
}
