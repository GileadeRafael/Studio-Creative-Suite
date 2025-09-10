
import React, { useState, useEffect, useRef } from 'react';
import { STYLE_SUGGESTIONS } from '../constants';
import { AspectRatio } from '../types';

interface PromptFormProps {
  onGenerate: (prompt: string, aspectRatio: AspectRatio, numberOfImages: number, options: { files: File[] }) => void;
  isLoading: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const hasReferenceImages = referenceFiles.length > 0;

  useEffect(() => {
    const newPreviews = referenceFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [referenceFiles]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsRef]);

  const handleStyleClick = (style: string) => {
    setPrompt(prev => prev ? `${prev.trim().replace(/,$/, '')}, ${style}` : style);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReferenceFiles(Array.from(e.target.files));
    }
  };
  
  const removeFile = (index: number) => {
    setReferenceFiles(files => files.filter((_, i) => i !== index));
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if(input) input.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt, aspectRatio, numberOfImages, { files: referenceFiles });
      setShowSettings(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative bg-zinc-900 p-3 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3">
        <label htmlFor="file-upload" className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </label>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*"/>
        
        {previews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
                <img src={preview} alt="preview" className="rounded-md w-11 h-11 object-cover" />
                <button type="button" onClick={() => removeFile(index)} className="absolute -top-1 -right-1 bg-zinc-600 hover:bg-zinc-500 text-white rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        ))}

        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={hasReferenceImages ? "Describe the edit you want to make..." : "A majestic cat astronaut floating in space..."}
          className="flex-1 w-full bg-zinc-900 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-zinc-500 transition-shadow border-none placeholder-zinc-500"
        />

        <div ref={settingsRef} className="relative">
             {showSettings && (
                <div className="absolute bottom-full right-0 mb-3 bg-zinc-800 rounded-lg p-4 shadow-lg border border-zinc-700 space-y-4 w-96">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${hasReferenceImages ? 'text-gray-500' : 'text-gray-300'}`}>
                            Number of Images {hasReferenceImages && "(edit mode)"}
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setNumberOfImages(num)}
                              disabled={hasReferenceImages}
                              className={`w-full p-2 rounded-md text-sm font-medium transition-colors ${numberOfImages === num ? 'bg-zinc-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-gray-200'} disabled:bg-zinc-700/50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="aspect-ratio" className={`block text-sm font-medium mb-2 ${hasReferenceImages ? 'text-gray-500' : 'text-gray-300'}`}>
                            Aspect Ratio {hasReferenceImages && "(from image)"}
                        </label>
                        <select 
                            id="aspect-ratio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-shadow disabled:bg-zinc-700/50 disabled:text-gray-400"
                            disabled={hasReferenceImages}
                        >
                            <option value={AspectRatio.SQUARE}>Square (1:1)</option>
                            <option value={AspectRatio.LANDSCAPE}>Landscape (16:9)</option>
                            <option value={AspectRatio.PORTRAIT}>Portrait (3:4)</option>
                            <option value={AspectRatio.LANDSCAPE_WIDE}>Landscape (4:3)</option>
                            <option value={AspectRatio.PORTRAIT_TALL}>Portrait (9:16)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quick Styles</label>
                        <div className="flex flex-wrap gap-2">
                        {STYLE_SUGGESTIONS.map((style) => (
                            <button type="button" key={style} onClick={() => handleStyleClick(style)} className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-gray-200 text-sm rounded-full transition-colors">
                            + {style}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>
            )}
            <button type="button" onClick={() => setShowSettings(s => !s)} className={`p-2.5 rounded-lg transition-colors ${showSettings ? 'bg-zinc-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
        </div>

        <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-11 h-11 flex items-center justify-center flex-shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Generate image"
        >
            {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            )}
        </button>
      </div>
    </form>
  );
};
