"use client";
import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
  coordinates: { lat: number; lng: number };
  zoom?: number;
}

export default function MapView({ coordinates, zoom = 19 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || !mapRef.current) return;
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });
    loader.load().then(() => {
      new google.maps.Map(mapRef.current!, {
        center: coordinates,
        zoom,
        mapTypeId: "satellite",
        tilt: 0,
        disableDefaultUI: true,
      });
    });
  }, [coordinates, zoom]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
