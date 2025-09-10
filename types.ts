// As definições de tipo para import.meta.env são manipuladas pelo Vite.
// Manter esta declaração pode causar conflitos ou confusão.
// declare global {
//   namespace NodeJS {
//     interface ProcessEnv {
//       API_KEY: string;
//     }
//   }
// }

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