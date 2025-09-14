// As variáveis de ambiente são injetadas no process.env pela configuração `define` do Vite.
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
  id?: string; // ID é opcional até ser salvo no DB
  url: string;
  enhancedUrl?: string;
  prompt: string;
  aspectRatio: AspectRatio;
  isFavorite?: boolean;
  isEnhanced?: boolean;
  referenceImages?: {
    data: string;
    mimeType: string;
  }[];
  project_id?: string; // Chave estrangeira
  user_id?: string; // Chave estrangeira
  created_at?: string;
}

export interface Project {
  id?: string; // ID é opcional até ser salvo no DB
  name: string;
  images: GeneratedImage[];
  created_at?: string; // ISO string
}

export interface User {
  id: string;
  username: string;
  email: string;
  photoURL: string;
}
