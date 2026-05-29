import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeLandscape(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  userDescription: string
): Promise<{ analysis: string; prompts: { style: string; prompt: string }[] }> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          {
            type: "text",
            text: `You are a professional landscape designer. Analyze this yard/garden photo and the user's request.

User's requested changes: "${userDescription}"

Respond with a JSON object (no markdown, raw JSON only):
{
  "analysis": "Brief analysis of the current landscape and what changes would work best",
  "prompts": [
    {
      "style": "Modern Minimalist",
      "prompt": "detailed img2img prompt for Stable Diffusion to generate this style variation"
    },
    {
      "style": "Lush Garden",
      "prompt": "detailed img2img prompt for Stable Diffusion to generate this style variation"
    },
    {
      "style": "Native Plants",
      "prompt": "detailed img2img prompt for Stable Diffusion to generate this style variation"
    }
  ]
}

Each prompt should be specific: describe exact plants, materials, colors, layout. Include "landscaping, professional landscape design, photorealistic" in each prompt.`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text);
}
