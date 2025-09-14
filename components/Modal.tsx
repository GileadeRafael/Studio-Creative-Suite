import React, { useState } from 'react';
import { GeneratedImage } from '../types';

interface ModalProps {
  image: GeneratedImage;
  galleryImages: GeneratedImage[];
  onClose: () => void;
  onImageChange: (image: GeneratedImage) => void;
  onCreateVariation: (image: GeneratedImage) => void;
  onEnhance: (image: GeneratedImage) => void;
  isEnhancing: boolean;
}

export const Modal: React.FC<ModalProps> = ({ image, galleryImages, onClose, onImageChange, onCreateVariation, onEnhance, isEnhancing }) => {
  const [sliderPos, setSliderPos] = useState(50);

  const handleDownload = () => {
    const urlToDownload = image.enhancedUrl || image.url;
    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = `studiocreative-${image.id.slice(0, 8)}${image.enhancedUrl ? '-enhanced' : ''}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateVariation = () => {
    onCreateVariation(image);
  };

  const handleEnhance = () => {
    if (!image.isEnhanced && !isEnhancing) {
        onEnhance(image);
    }
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
            <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
                {image.enhancedUrl ? (
                    <div className="relative w-full h-full max-w-full max-h-full select-none group">
                        <img
                            src={image.url}
                            alt={image.prompt}
                            className="absolute inset-0 w-full h-full object-contain rounded-md pointer-events-none"
                            draggable={false}
                        />
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                        >
                            <img
                                src={image.enhancedUrl}
                                alt={`Enhanced: ${image.prompt}`}
                                className="absolute inset-0 w-full h-full object-contain rounded-md pointer-events-none"
                                draggable={false}
                            />
                        </div>
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg text-zinc-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPos}
                            onInput={(e) => setSliderPos(Number((e.target as HTMLInputElement).value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                            aria-label="Compare original and enhanced image"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none">Original</div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none" style={{ opacity: sliderPos > 90 ? 1 : 0, transition: 'opacity 0.3s' }}>Enhanced</div>
                    </div>
                ) : (
                    <img src={image.url} alt={image.prompt} className="max-w-full max-h-full object-contain rounded-md" />
                )}
            </div>
            <div className="w-full md:w-1/3 h-1/2 md:h-full p-6 flex flex-col space-y-4 overflow-y-auto">
                <div>
                    <h2 id="image-modal-title" className="text-sm font-semibold uppercase text-gray-400 mb-2">Prompt</h2>
                    <p className="text-gray-200 bg-zinc-800 p-3 rounded-md max-h-24 overflow-y-auto">{image.prompt}</p>
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
                     {image.isEnhanced && <p className="text-green-400 text-sm mt-1">Enhanced</p>}
                </div>

                <div className="flex-grow min-h-[1rem]"></div>
                
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <button
                        onClick={handleEnhance}
                        disabled={image.isEnhanced || isEnhancing}
                        className="w-full flex justify-center items-center py-3 px-4 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-zinc-500 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    >
                        {isEnhancing ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Enhancing...</>
                        ) : (
                            <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>{image.isEnhanced ? 'Enhanced' : 'Upscale & Enhance'}</>
                        )}
                    </button>
                    <button onClick={handleCreateVariation} className="w-full flex justify-center items-center py-3 px-4 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-zinc-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" /></svg>Create Variation</button>
                    <button onClick={handleDownload} className="w-full flex justify-center items-center py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Download</button>
                </div>
                <div className="pt-4 border-t border-zinc-800">
                    <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Project Images</h3>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
                        {galleryImages.map(thumb => (
                             <button
                                key={thumb.id}
                                onClick={() => onImageChange(thumb)}
                                className={`block w-full aspect-square rounded-md overflow-hidden relative transition-all duration-200 ${thumb.id === image.id ? 'ring-2 ring-white' : 'ring-1 ring-zinc-700 hover:ring-zinc-500'}`}
                                aria-label={`View image with prompt: ${thumb.prompt}`}
                            >
                                <img src={thumb.url} alt={thumb.prompt} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
