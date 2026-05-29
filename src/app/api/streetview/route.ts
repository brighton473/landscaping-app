import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!lat || !lng || !key) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const metaRes = await fetch(
    `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${key}`
  );
  const meta = await metaRes.json();

  if (meta.status !== "OK") {
    return NextResponse.json({ error: "Street View unavailable" }, { status: 404 });
  }

  const imageRes = await fetch(
    `https://maps.googleapis.com/maps/api/streetview?size=640x480&location=${lat},${lng}&fov=90&key=${key}`
  );

  if (!imageRes.ok) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }

  const buffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";

  return NextResponse.json({ base64, contentType });
}
