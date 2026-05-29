"use client";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { UploadedPhoto } from "@/lib/types";

interface Props {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  onChange: (address: string, coordinates: { lat: number; lng: number } | null) => void;
  onPhotoChange: (photo: UploadedPhoto | null) => void;
}

export default function AddressStep({ address, coordinates, onChange, onPhotoChange }: Props) {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [streetViewStatus, setStreetViewStatus] = useState<"loading" | "ok" | "unavailable" | null>(null);
  const [fetchingPhoto, setFetchingPhoto] = useState(false);
  const [useUpload, setUseUpload] = useState(false);
  const [streetViewPhoto, setStreetViewPhoto] = useState<UploadedPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;
    new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    }).load().then(() => setMapsLoaded(true));
  }, []);

  useEffect(() => {
    if (!coordinates || !mapsLoaded || !streetViewRef.current) return;

    setStreetViewStatus("loading");
    const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
      position: coordinates,
      pov: { heading: 0, pitch: 0 },
      zoom: 0,
      addressControl: false,
      linksControl: false,
      enableCloseButton: false,
    });

    google.maps.event.addListenerOnce(panorama, "status_changed", () => {
      if (panorama.getStatus() === google.maps.StreetViewStatus.OK) {
        setStreetViewStatus("ok");
      } else {
        setStreetViewStatus("unavailable");
        setUseUpload(true);
      }
    });
  }, [coordinates, mapsLoaded]);

  useEffect(() => {
    if (streetViewStatus !== "ok" || !coordinates || useUpload) return;

    setFetchingPhoto(true);
    fetch(`/api/streetview?lat=${coordinates.lat}&lng=${coordinates.lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) { setStreetViewStatus("unavailable"); return; }
        const photo: UploadedPhoto = {
          id: crypto.randomUUID(),
          file: null,
          previewUrl: `data:${data.contentType};base64,${data.base64}`,
          base64: data.base64,
        };
        setStreetViewPhoto(photo);
        onPhotoChange(photo);
      })
      .catch(() => setStreetViewStatus("unavailable"))
      .finally(() => setFetchingPhoto(false));
  }, [streetViewStatus, coordinates]);

  async function handleSearch() {
    if (!inputValue.trim() || !mapsLoaded) return;
    setLoading(true);
    setError("");
    setStreetViewStatus(null);
    setUseUpload(false);
    setStreetViewPhoto(null);
    onPhotoChange(null);

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: inputValue });
      if (!result.results.length) throw new Error("Address not found");
      const loc = result.results[0].geometry.location;
      onChange(inputValue, { lat: loc.lat(), lng: loc.lng() });
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(files: FileList | null) {
    if (!files?.[0]) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const photo: UploadedPhoto = {
        id: crypto.randomUUID(),
        file,
        previewUrl: dataUrl,
        base64: dataUrl.split(",")[1],
      };
      onPhotoChange(photo);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Where is your property?</h2>
        <p className="text-gray-500 text-sm">We&apos;ll pull a Street View of your home&apos;s exterior.</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="123 Main St, San Francisco, CA"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !mapsLoaded}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {coordinates && (
        <div
          ref={streetViewRef}
          className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
        />
      )}

      {streetViewStatus === "ok" && !useUpload && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-sm text-green-700">
            {fetchingPhoto ? "Capturing Street View photo..." : "Using your Street View photo"}
          </p>
          <button
            onClick={() => { setUseUpload(true); onPhotoChange(null); }}
            className="text-sm text-primary-600 hover:underline font-medium ml-4"
          >
            Outdated? Upload instead
          </button>
        </div>
      )}

      {streetViewStatus === "unavailable" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-700">Street View not available for this address. Please upload a photo.</p>
        </div>
      )}

      {useUpload && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Upload a photo of your home&apos;s exterior</p>
            {streetViewStatus === "ok" && (
              <button
                onClick={() => { setUseUpload(false); onPhotoChange(streetViewPhoto); }}
                className="text-sm text-primary-600 hover:underline"
              >
                Use Street View instead
              </button>
            )}
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 16v-8m-4 4l4-4 4 4M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Click to upload</p>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
