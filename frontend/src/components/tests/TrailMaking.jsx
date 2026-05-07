import { useState, useCallback } from "react";
import { TestProgressHeader } from "../shared/UI";
import { CheckCircle, XCircle } from "lucide-react";

function randomPositions(count, size = 280) {
  const pts = [];
  let tries = 0;
  while (pts.length < count && tries < 500) {
    const x = 20 + Math.random() * (size - 40);
    const y = 20 + Math.random() * (size - 40);
    const tooClose = pts.some(p => Math.hypot(p.x - x, p.y - y) < 48);
    if (!tooClose) pts.push({ x, y });
    tries++;
  }
  return pts;
} 

function TrailPart({ nodes, labels, onComplete }) {
  const [clicked, setClicked] = useState([]);
  const [errors, setErrors] = useState(0);
  const [started] = useState(Date.now());

  const handleClick = (i) => {
    if (clicked.includes(i)) return;
    const expected = clicked.length;
    if (i !== expected) {
      setErrors(e => e + 1);
      return;
    }
    const newClicked = [...clicked, i];
    setClicked(newClicked);
    if (newClicked.length === nodes.length) {
      const time = Math.round((Date.now() - started) / 1000);
      onComplete({ errors, time, clicked: newClicked });
    }
  };

  return (
    <div className="relative w-72 h-72 mx-auto bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden select-none">
      {/* Lines between clicked nodes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
        {clicked.slice(1).map((_, i) => {
          const a = nodes[clicked[i]];
          const b = nodes[clicked[i + 1]];
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#3b82f6" strokeWidth="2" />;
        })}
      </svg>

      {nodes.map((pos, i) => {
        const isDone = clicked.includes(i);
        const isNext = clicked.length === i;
        return (
          <button key={i}
            onClick={() => handleClick(i)}
            style={{ left: pos.x - 20, top: pos.y - 20 }}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${isDone ? "bg-brand-600 text-white scale-90" : isNext ? "bg-white border-2 border-brand-500 text-brand-700 shadow-md hover:scale-110" : "bg-white border-2 border-slate-300 text-slate-600 hover:border-slate-400"}`}>
            {labels[i]}
          </button>
        );
      })}

      {errors > 0 && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg font-semibold">
          {errors} error{errors > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default function TrailMaking({ onComplete, testIndex, totalTests }) {
  const [part, setPart] = useState("A");
  const [partAResult, setPartAResult] = useState(null);
  const [started] = useState(Date.now());

  const [nodesA] = useState(() => randomPositions(10));
  const [nodesB] = useState(() => randomPositions(10));

  const labelsA = ["1","2","3","4","5","6","7","8","9","10"];
  const labelsB = ["1","A","2","B","3","C","4","D","5","E"];

  const handlePartA = (result) => {
    setPartAResult(result);
    setPart("B");
  };

  const handlePartB = useCallback((result) => {
    const totalErrors = (partAResult?.errors || 0) + (result?.errors || 0);
    const score = Math.max(0, 5 - Math.floor(totalErrors / 2));
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({ score, maxScore: 5, timeTaken: time, responses: [{ partA: partAResult, partB: result }] });
  }, [partAResult, started, onComplete]);

  return (
    <div className="page-enter">
      <TestProgressHeader current={testIndex + 1} total={totalTests} testName="Trail Making Test" />

      <div className="card max-w-lg mx-auto text-center">
        <div className="flex gap-2 justify-center mb-4">
          {["A", "B"].map(p => (
            <span key={p} className={`px-4 py-1 rounded-full text-sm font-semibold ${part === p ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              Part {p}
            </span>
          ))}
        </div>

        <p className="text-slate-600 text-sm mb-4">
          {part === "A"
            ? "Click the circles in order: 1 → 2 → 3 → ... → 10"
            : "Alternate between numbers and letters: 1 → A → 2 → B → 3 → C → ..."}
        </p>

        {part === "A" && <TrailPart nodes={nodesA} labels={labelsA} onComplete={handlePartA} />}
        {part === "B" && <TrailPart nodes={nodesB} labels={labelsB} onComplete={handlePartB} />}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Click each circle in the correct sequence without making errors.
      </p>
    </div>
  );
}
