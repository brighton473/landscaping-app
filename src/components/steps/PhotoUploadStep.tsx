"use client";
import { useCallback, useRef } from "react";
import type { UploadedPhoto } from "@/lib/types";

interface Props {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
}

async function fileToUploadedPhoto(file: File): Promise<UploadedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve({
        id: crypto.randomUUID(),
        file,
        previewUrl: dataUrl,
        base64,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoUploadStep({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const newPhotos = await Promise.all(
        Array.from(files)
          .filter((f) => f.type.startsWith("image/"))
          .map(fileToUploadedPhoto)
      );
      onChange([...photos, ...newPhotos]);
    },
    [photos, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removePhoto(id: string) {
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Upload yard photos</h2>
        <p className="text-gray-500 text-sm">
          Add photos of the areas you want to redesign. More angles = better results.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center gap-2 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
      >
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 16v-8m-4 4l4-4 4 4M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
        </svg>
        <p className="text-sm font-medium text-gray-600">Drop photos here or click to browse</p>
        <p className="text-xs text-gray-400">JPG, PNG, WEBP up to 10MB each</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="yard" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
