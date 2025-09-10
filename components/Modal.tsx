
import React from 'react';
import { GeneratedImage } from '../types';

interface ModalProps {
  image: GeneratedImage;
  onClose: () => void;
  onCreateVariation: (image: GeneratedImage) => void;
}

export const Modal: React.FC<ModalProps> = ({ image, onClose, onCreateVariation }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `studiocreative-${image.id.slice(0, 8)}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateVariation = () => {
    onCreateVariation(image);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-40"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-modal-title"
    >
        <div 
            className="w-full max-w-6xl h-full max-h-[90vh] bg-zinc-900 rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black flex items-center justify-center p-4">
                <img src={image.url} alt={image.prompt} className="max-w-full max-h-full object-contain rounded-md"/>
            </div>
            <div className="w-full md:w-1/3 h-1/2 md:h-full p-6 flex flex-col space-y-4 overflow-y-auto">
                <div>
                    <h2 id="image-modal-title" className="text-sm font-semibold uppercase text-gray-400 mb-2">Prompt</h2>
                    <p className="text-gray-200 bg-zinc-800 p-3 rounded-md">{image.prompt}</p>
                </div>
                {image.referenceImages && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Reference Image(s)</h3>
                    <div className="flex gap-2">
                      {image.referenceImages.map((refImg, index) => (
                        <img key={index} src={`data:${refImg.mimeType};base64,${refImg.data}`} className="w-16 h-16 rounded-md object-cover"/>
                      ))}
                    </div>
                  </div>
                )}
                 <div>
                    <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">Details</h2>
                    <p className="text-gray-300 text-sm">Aspect Ratio: {image.aspectRatio}</p>
                </div>
                <div className="flex-grow"></div>
                <div className="space-y-3">
                    <button
                        onClick={handleCreateVariation}
                        className="w-full flex justify-center items-center py-3 px-4 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-zinc-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                        </svg>
                        Create Variation
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-full flex justify-center items-center py-3 px-4 bg-zinc-600 hover:bg-zinc-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-zinc-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>
        </div>
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
  );
};
