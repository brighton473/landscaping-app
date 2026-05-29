import { NextRequest, NextResponse } from "next/server";
import { analyzeLandscape } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { base64, mediaType, description } = await req.json();

  if (!base64 || !description) {
    return NextResponse.json({ error: "Missing image or description" }, { status: 400 });
  }

  const result = await analyzeLandscape(base64, mediaType ?? "image/jpeg", description);
  return NextResponse.json(result);
}
