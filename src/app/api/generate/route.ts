import { NextRequest, NextResponse } from "next/server";
import { generateVariation } from "@/lib/replicate";
import type { DesignVariation } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { base64, prompts } = await req.json() as {
    base64: string;
    prompts: { style: string; prompt: string }[];
  };

  if (!base64 || !prompts?.length) {
    return NextResponse.json({ error: "Missing image or prompts" }, { status: 400 });
  }

  // Generate all variations in parallel
  const variations = await Promise.all(
    prompts.map(async ({ style, prompt }): Promise<DesignVariation> => {
      const imageUrl = await generateVariation(base64, prompt);
      return {
        id: crypto.randomUUID(),
        imageUrl,
        prompt,
        style,
      };
    })
  );

  return NextResponse.json({ variations });
}
