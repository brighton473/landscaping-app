"use client";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  onChange: (address: string, coordinates: { lat: number; lng: number } | null) => void;
}

export default function AddressStep({ address, coordinates, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [inputValue, setInputValue] = useState(address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });
    loader.load().then(() => {
      if (!mapRef.current) return;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: coordinates ?? { lat: 37.7749, lng: -122.4194 },
        zoom: coordinates ? 18 : 4,
        mapTypeId: "satellite",
        tilt: 0,
      });
    });
  }, []);

  async function handleSearch() {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError("");
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: inputValue });
      if (!result.results.length) throw new Error("Address not found");
      const loc = result.results[0].geometry.location;
      const coords = { lat: loc.lat(), lng: loc.lng() };
      mapInstance.current?.setCenter(coords);
      mapInstance.current?.setZoom(19);
      onChange(inputValue, coords);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Where is your property?</h2>
        <p className="text-gray-500 text-sm">We'll pull a satellite view of your yard.</p>
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
          disabled={loading}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
      >
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to enable map
          </div>
        )}
      </div>

      {coordinates && (
        <p className="text-xs text-gray-400">
          {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
