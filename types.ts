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

export interface User {
  id: string;
  email: string;
  username: string;
  photoURL?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  enhancedUrl?: string;
  prompt: string;
  aspectRatio: AspectRatio;
  isFavorite: boolean;
  isEnhanced: boolean;
  referenceImages?: {
    data: string;
    mimeType: string;
  }[];
  created_at?: string;
  user_id?: string;
  project_id?: string;
}
// FIX: Added the missing 'Project' type definition to resolve an import error in ProjectsSidebar.tsx.
export interface Project {
  id: string;
  name: string;
  images: GeneratedImage[];
  created_at?: string;
  user_id?: string;
}
