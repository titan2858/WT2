import { useRef, useState, useEffect, useCallback } from "react";
import { TestProgressHeader } from "../shared/UI";
import { Trash2 } from "lucide-react";
import { useLang } from "../../store/langContext";

export default function ClockDrawing({ onComplete, testIndex, totalTests }) {
  const { t } = useLang();

  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [started] = useState(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 300, 300);
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    [12,1,2,3,4,5,6,7,8,9,10,11].forEach((n, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      ctx.fillText(n, 150 + 118 * Math.cos(angle), 150 + 118 * Math.sin(angle));
    });
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e, canvasRef.current);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clearCanvas = () => {
    setHasDrawn(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);
  };

  const handleSubmit = useCallback(() => {
    const time = Math.round((Date.now() - started) / 1000);
    onComplete({ score: 0, maxScore: 5, timeTaken: time });
  }, [started, onComplete]);

  return (
    <div className="page-enter">
      <TestProgressHeader
        current={testIndex + 1}
        total={totalTests}
        testName={t("clock_name")}
      />

      <div className="card max-w-lg mx-auto text-center">
        <p>{t("clock_instruction")} 11:10</p>

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
        />

        <button onClick={clearCanvas}>{t("clock_clear")}</button>
        <button onClick={handleSubmit} disabled={!hasDrawn}>
          {t("clock_submit")}
        </button>
      </div>
    </div>
  );
}