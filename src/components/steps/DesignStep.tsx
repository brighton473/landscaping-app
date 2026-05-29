"use client";
import { useState } from "react";
import DesignVariations from "@/components/DesignVariations";
import type { DesignSession, DesignVariation } from "@/lib/types";

interface Props {
  session: DesignSession;
  onUpdate: (session: DesignSession) => void;
}

type Phase = "describe" | "generating" | "variations" | "selected";

export default function DesignStep({ session, onUpdate }: Props) {
  const [phase, setPhase] = useState<Phase>("describe");
  const [description, setDescription] = useState(session.description);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [selectedPhoto] = useState(session.photos[0]);

  async function handleGenerate() {
    if (!description.trim()) return;
    setPhase("generating");
    setError("");

    try {
      // Step 1: Claude analyzes the photo and creates prompts
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: selectedPhoto.base64,
          mediaType: selectedPhoto.file.type,
          description,
        }),
      });
      const { analysis: analysisText, prompts } = await analyzeRes.json();
      setAnalysis(analysisText);

      // Step 2: Replicate generates image variations
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: selectedPhoto.base64, prompts }),
      });
      const { variations } = await generateRes.json();

      onUpdate({ ...session, description, variations });
      setPhase("variations");
    } catch {
      setError("Generation failed. Check your API keys and try again.");
      setPhase("describe");
    }
  }

  function handleSelect(variation: DesignVariation) {
    onUpdate({ ...session, selectedVariation: variation });
    setPhase("selected");
  }

  function handleRegenerate() {
    setPhase("describe");
    onUpdate({ ...session, variations: [], selectedVariation: null });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        {/* Original photo */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Your Yard</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPhoto?.previewUrl}
            alt="original yard"
            className="w-full rounded-xl object-cover aspect-video"
          />
        </div>

        {/* Selected variation or placeholder */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Design Preview</p>
          {session.selectedVariation ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.selectedVariation.imageUrl}
                alt="selected design"
                className="w-full rounded-xl object-cover aspect-video"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {session.selectedVariation.style}
              </span>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
              {phase === "generating" ? "Generating..." : "Choose a variation below"}
            </div>
          )}
        </div>
      </div>

      {/* Annotations summary */}
      {session.annotations?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Your marked changes:</p>
          {session.annotations.map((ann, i) => (
            <div key={ann.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ann.color }} />
              <span className="text-xs text-gray-400">{i + 1}</span>
              <p className="text-sm">{ann.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Description input */}
      {(phase === "describe" || phase === "selected") && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Any additional details?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Add a stone pathway through the middle, plant roses along the fence, replace the dead grass with drought-tolerant plants..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!description.trim()}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-40"
            >
              Generate 3 Design Variations
            </button>
            {phase === "selected" && (
              <button onClick={handleRegenerate} className="px-4 py-3 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                Start Over
              </button>
            )}
          </div>
        </div>
      )}

      {/* Generating state */}
      {phase === "generating" && (
        <div className="text-center py-8 space-y-3">
          <div className="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Creating your design variations...</p>
          {analysis && (
            <p className="text-sm text-gray-500 max-w-lg mx-auto">{analysis}</p>
          )}
        </div>
      )}

      {/* Variations grid */}
      {phase === "variations" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose a style to proceed</h3>
          <DesignVariations
            variations={session.variations}
            selected={session.selectedVariation}
            onSelect={handleSelect}
          />
          <button onClick={handleRegenerate} className="mt-4 text-sm text-gray-500 underline hover:text-gray-700">
            Regenerate with different description
          </button>
        </div>
      )}
    </div>
  );
}
