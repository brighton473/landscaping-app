export interface DesignSession {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  photos: UploadedPhoto[];
  description: string;
  variations: DesignVariation[];
  selectedVariation: DesignVariation | null;
}

export interface UploadedPhoto {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export interface DesignVariation {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
}

export interface AnalyzeResponse {
  analysis: string;
  prompts: { style: string; prompt: string }[];
}

export interface GenerateResponse {
  variations: DesignVariation[];
}
