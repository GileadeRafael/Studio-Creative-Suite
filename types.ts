// The build environment is expected to provide process.env.
// This is a type definition for TypeScript to prevent compilation errors.
// FIX: Augment the NodeJS.ProcessEnv interface instead of redeclaring the global 'process' variable to avoid type conflicts.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '3:4',
  LANDSCAPE_WIDE = '4:3',
  PORTRAIT_TALL = '9:16',
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  isFavorite?: boolean;
  referenceImages?: {
    data: string;
    mimeType: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  photoURL: string;
}