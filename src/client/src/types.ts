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

export interface User {
  _id: string;
  username: string;
  email: string;
  images?: Image[];
  imageCount?: number;
  favoritePrompts?: string[];
  preferences?: UserPreferences;
  createdAt?: string;
}

export interface UserPreferences {
  defaultStyle?: string;
  theme?: string;
}

export interface Image {
  _id: string;
  prompt: string;
  style?: string;
  imageUrl: string;
  predictionId: string;
  user: User;
  tags?: string[];
  isFavorite?: boolean;
  metadata?: ImageMetadata;
  createdAt?: string;
  createdAtFormatted?: string;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  generationTime?: number;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface LoginData {
  login: AuthData;
}

export interface SignupData {
  addUser: AuthData;
}