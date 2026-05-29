"use client";
import { useRef, useState, useEffect } from "react";
import type { Annotation, UploadedPhoto } from "@/lib/types";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];

interface Props {
  photo: UploadedPhoto;
  annotations: Annotation[];
  onChange: (annotations: Annotation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AnnotateStep({ photo, annotations, onChange, onNext, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [pendingRect, setPendingRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [pendingLabel, setPendingLabel] = useState("");

  const nextColor = COLORS[annotations.length % COLORS.length];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ann of annotations) {
      const x = ann.x * canvas.width;
      const y = ann.y * canvas.height;
      const w = ann.width * canvas.width;
      const h = ann.height * canvas.height;

      ctx.fillStyle = ann.color + "33";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, w, h);

      ctx.font = "bold 12px sans-serif";
      const textWidth = ctx.measureText(ann.label).width;
      ctx.fillStyle = ann.color;
      ctx.fillRect(x, y, textWidth + 8, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(ann.label, x + 4, y + 14);
    }

    if (drawing) {
      const x = Math.min(dragStart.x, dragCurrent.x) * canvas.width;
      const y = Math.min(dragStart.y, dragCurrent.y) * canvas.height;
      const w = Math.abs(dragCurrent.x - dragStart.x) * canvas.width;
      const h = Math.abs(dragCurrent.y - dragStart.y) * canvas.height;

      ctx.fillStyle = nextColor + "22";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = nextColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  }, [annotations, drawing, dragStart, dragCurrent, nextColor]);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (pendingRect) return;
    const pos = getPos(e);
    setDragStart(pos);
    setDragCurrent(pos);
    setDrawing(true);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    setDragCurrent(getPos(e));
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);
    const w = Math.abs(pos.x - dragStart.x);
    const h = Math.abs(pos.y - dragStart.y);
    if (w < 0.02 || h < 0.02) return;
    setPendingRect({ x, y, w, h });
  }

  function confirmLabel() {
    if (!pendingRect || !pendingLabel.trim()) return;
    onChange([...annotations, {
      id: crypto.randomUUID(),
      x: pendingRect.x,
      y: pendingRect.y,
      width: pendingRect.w,
      height: pendingRect.h,
      label: pendingLabel.trim(),
      color: nextColor,
    }]);
    setPendingRect(null);
    setPendingLabel("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Highlight areas to change</h2>
        <p className="text-gray-500 text-sm">Draw a box over any area, then describe what you want done with it.</p>
      </div>

      <div className="relative w-full select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.previewUrl} alt="yard" className="w-full rounded-xl object-cover pointer-events-none" />
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          className="absolute inset-0 w-full h-full rounded-xl cursor-crosshair"
        />
      </div>

      {pendingRect && (
        <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: nextColor }} />
          <input
            autoFocus
            type="text"
            value={pendingLabel}
            onChange={e => setPendingLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && confirmLabel()}
            placeholder="e.g. Remove this tree, add roses here..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={confirmLabel}
            disabled={!pendingLabel.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-40"
          >
            Add
          </button>
          <button
            onClick={() => setPendingRect(null)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}

      {annotations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Marked areas ({annotations.length}):</p>
          {annotations.map((ann, i) => (
            <div key={ann.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ann.color }} />
              <span className="text-xs text-gray-400 font-medium">{i + 1}</span>
              <p className="text-sm flex-1">{ann.label}</p>
              <button
                onClick={() => onChange(annotations.filter(a => a.id !== ann.id))}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <button onClick={onBack} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={annotations.length === 0}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40"
        >
          Continue to Design →
        </button>
      </div>
    </div>
  );
}
