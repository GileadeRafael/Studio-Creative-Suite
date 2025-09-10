
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