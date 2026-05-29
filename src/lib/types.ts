export interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export interface DesignSession {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  photos: UploadedPhoto[];
  annotations: Annotation[];
  description: string;
  variations: DesignVariation[];
  selectedVariation: DesignVariation | null;
}

export interface UploadedPhoto {
  id: string;
  file: File | null;
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
