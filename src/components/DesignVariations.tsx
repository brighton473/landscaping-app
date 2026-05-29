"use client";
import type { DesignVariation } from "@/lib/types";

interface Props {
  variations: DesignVariation[];
  selected: DesignVariation | null;
  onSelect: (variation: DesignVariation) => void;
}

export default function DesignVariations({ variations, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {variations.map((v) => {
        const isSelected = selected?.id === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className={`group relative rounded-xl overflow-hidden text-left ring-2 transition-all
              ${isSelected ? "ring-primary-500 scale-[1.02]" : "ring-transparent hover:ring-gray-300"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.imageUrl}
              alt={v.style}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-semibold text-sm">{v.style}</p>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
