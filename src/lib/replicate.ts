import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Uses SDXL img2img to transform the uploaded yard photo
export async function generateVariation(
  imageBase64: string,
  prompt: string
): Promise<string> {
  const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

  const output = await replicate.run(
    "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496ce96ce79c2aef6b27",
    {
      input: {
        image: imageDataUrl,
        prompt: prompt,
        prompt_strength: 0.6, // how much to change vs keep original
        num_inference_steps: 30,
        guidance_scale: 7.5,
        negative_prompt:
          "ugly, blurry, low quality, cartoon, drawing, painting",
      },
    }
  );

  const urls = output as string[];
  return urls[0];
}
