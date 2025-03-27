export interface GenerateImageInput {
  prompt: string;
  style?: string;
}

export interface GenerateImageResult {
  predictionId: string;
  status: string;
  imageUrl: string;
}

export interface GenerateImageData {
  generateImage: GenerateImageResult;
}