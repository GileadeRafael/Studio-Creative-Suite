import React from 'react';
import { ImageCard } from './ImageCard';
import { GeneratedImage } from '../types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onImageSelect: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  view: 'all' | 'favorites';
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageSelect, onDelete, onToggleFavorite, view }) => {
  if (images.length === 0) {
    const isAllView = view === 'all';
    const title = isAllView ? "Your Creative Canvas Awaits" : "Your Library is Empty";
    const message = isAllView 
      ? "Use the bar below to enter a prompt or upload an image to start your creative journey. The AI will weave your words into unique visual masterpieces."
      : "Favorite an image by clicking the heart icon to add it to your personal library.";
      
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-300">{title}</h2>
        <p className="mt-2 max-w-md">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {images.map(image => (
        <ImageCard 
          key={image.id} 
          image={image} 
          onImageSelect={onImageSelect}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};