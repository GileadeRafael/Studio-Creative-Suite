import React from 'react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onImageSelect: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onImageSelect, onDelete, onToggleFavorite }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o modal abra
    onDelete(image.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o modal abra
    onToggleFavorite(image.id);
  };
  
  return (
    <div
      onClick={() => onImageSelect(image)}
      className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer focus:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-zinc-500"
      aria-label={`View details for prompt: ${image.prompt}`}
    >
      <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Indicador de Favorito */}
      {image.isFavorite && (
         <div className="absolute top-2 right-2 text-red-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 drop-shadow-lg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
             </svg>
         </div>
      )}

      {/* Botões de Hover */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full bg-black/50 hover:bg-black/75 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500"
            aria-label={image.isFavorite ? 'Unfavorite' : 'Favorite'}
        >
             {image.isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
             )}
        </button>
        <button
            onClick={handleDelete}
            className="p-2 rounded-full bg-black/50 hover:bg-black/75 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500"
            aria-label="Delete image"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
      </div>
    </div>
  );
};
