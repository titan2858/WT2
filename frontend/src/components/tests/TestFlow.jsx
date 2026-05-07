import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resultsAPI, sessionsAPI } from "../../services/api";
import { Spinner } from "../shared/UI";
import { Brain } from "lucide-react";
import { useLang } from "../../store/langContext";

import SerialSubtraction  from "./SerialSubtraction";
import WordRecall         from "./WordRecall";
import ClockDrawing       from "./ClockDrawing";
import TrailMaking        from "./TrailMaking";
import Orientation        from "./Orientation";
import DigitSpan          from "./DigitSpan";
import PatternRecognition from "./PatternRecognition";
import VerbalFluency      from "./VerbalFluency";

const TESTS = [
  { name: "Serial Subtraction",   component: SerialSubtraction  },
  { name: "Word Recall",          component: WordRecall         },
  { name: "Clock Drawing",        component: ClockDrawing       },
  { name: "Trail Making",         component: TrailMaking        },
  { name: "Orientation",          component: Orientation        },
  { name: "Digit Span",           component: DigitSpan          },
  { name: "Pattern Recognition",  component: PatternRecognition },
  { name: "Verbal Fluency",       component: VerbalFluency      },
];

export default function TestFlow({ sessionId }) {
  const [currentTest, setCurrentTest] = useState(0);
  const [resting, setResting] = useState(false);
  const [restCount, setRestCount] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLang();

  const handleTestComplete = useCallback(async (result) => {
    try {
      await resultsAPI.submit({
        session_id: sessionId,
        test_name: TESTS[currentTest].name,
        test_index: currentTest,
        score: result.score,
        max_score: result.maxScore,
        time_taken_seconds: result.timeTaken,
        responses: result.responses || [],
        doctor_review_required: result.doctorReviewRequired || false,
      });

      if (currentTest + 1 >= TESTS.length) {
        setSubmitting(true);
        await sessionsAPI.complete(sessionId);
        navigate(`/results/${sessionId}`);
      } else {
        setResting(true);
        let c = 3;
        setRestCount(c);
        const interval = setInterval(() => {
          c--;
          setRestCount(c);
          if (c <= 0) {
            clearInterval(interval);
            setResting(false);
            setCurrentTest(tc => tc + 1);
          }
        }, 1000);
      }
    } catch (err) {
      toast.error(t("failed_save"));
    }
  }, [currentTest, sessionId, navigate, t]);

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-500">{t("saving")}</p>
        </div>
      </div>
    );
  }

  if (resting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
        <div className="text-center animate-fade-in">
          <Brain className="h-12 w-12 text-brand-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-display font-bold text-slate-700 mb-2">{t("great_job")}</h2>
          <p className="text-slate-500 mb-6">{t("next_starting")}</p>
          <div className="text-6xl font-display font-bold text-brand-600">{restCount}</div>
          <p className="text-slate-400 text-sm mt-4">
            {t("up_next")} <strong className="text-slate-600">{TESTS[currentTest + 1]?.name}</strong>
          </p>
        </div>
      </div>
    );
  }

  const TestComponent = TESTS[currentTest].component;
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <TestComponent
          testIndex={currentTest}
          totalTests={TESTS.length}
          onComplete={handleTestComplete}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}
