import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGallery } from './components/ImageGallery';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { generateImage as generateImageFromApi, editImage, fileToBase64 } from './services/geminiService';
import { authService } from './services/authService';
import { GeneratedImage, AspectRatio, User } from './types';

interface GenerationOptions {
  files?: File[];
  referenceImages?: { data: string; mimeType: string }[];
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup' | 'app'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [galleryView, setGalleryView] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      handleLogin(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`studio-images-${currentUser.email}`, JSON.stringify(generatedImages));
    }
  }, [generatedImages, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const userImages = localStorage.getItem(`studio-images-${user.email}`);
    setGeneratedImages(userImages ? JSON.parse(userImages) : []);
    setView('app');
  };

  const handleLogout = () => {
    if (currentUser) {
      localStorage.setItem(`studio-images-${currentUser.email}`, JSON.stringify(generatedImages));
    }
    authService.logout();
    setCurrentUser(null);
    setGeneratedImages([]);
    setView('login');
  };
  
  const handleGenerate = useCallback(async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number, options: GenerationOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      let imageUrls: string[];
      let referenceImages: { data: string; mimeType: string }[] | undefined = undefined;

      if (options.files && options.files.length > 0) {
        referenceImages = await Promise.all(
          options.files.map(async (file) => ({
            data: await fileToBase64(file),
            mimeType: file.type,
          }))
        );
        imageUrls = [await editImage(prompt, referenceImages)];
      } else if (options.referenceImages && options.referenceImages.length > 0) {
        referenceImages = options.referenceImages;
        imageUrls = [await editImage(prompt, referenceImages)];
      } else {
        imageUrls = await generateImageFromApi(prompt, aspectRatio, numberOfImages);
      }
      
      const newImages: GeneratedImage[] = imageUrls.map(url => ({
        id: new Date().toISOString() + Math.random(),
        url: url,
        prompt: prompt,
        aspectRatio: aspectRatio,
        referenceImages: referenceImages,
        isFavorite: false,
      }));

      setGeneratedImages(prevImages => [...newImages, ...prevImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateVariation = useCallback((image: GeneratedImage) => {
    setSelectedImage(null);
    handleGenerate(image.prompt, image.aspectRatio, 1, { referenceImages: image.referenceImages });
  }, [handleGenerate]);

  const handleDeleteImage = useCallback((id: string) => {
    setGeneratedImages(prev => prev.filter(image => image.id !== id));
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setGeneratedImages(prev => prev.map(image => 
      image.id === id ? { ...image, isFavorite: !image.isFavorite } : image
    ));
  }, []);

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setView('signup')} />;
  }
  if (view === 'signup') {
    return <SignupPage onSignup={handleLogin} onNavigateToLogin={() => setView('login')} />;
  }

  return (
    <>
      {currentUser && (
        <div className="flex flex-col h-screen bg-black text-gray-100">
          {isLoading && <Loader />}
          {selectedImage && (
            <Modal 
              image={selectedImage} 
              onClose={() => setSelectedImage(null)} 
              onCreateVariation={handleCreateVariation} 
            />
          )}
          
          <Header 
            user={currentUser}
            onLogout={handleLogout}
            onShowLibrary={() => setGalleryView('favorites')}
            onShowAll={() => setGalleryView('all')}
          />

          <main className="flex-1 overflow-y-auto pt-20 pb-40 px-6 md:px-8 lg:px-10">
            <ImageGallery 
              images={galleryView === 'favorites' ? generatedImages.filter(img => img.isFavorite) : generatedImages} 
              onImageSelect={setSelectedImage}
              onDelete={handleDeleteImage}
              onToggleFavorite={handleToggleFavorite}
              view={galleryView}
            />
          </main>

          <footer className="fixed bottom-0 left-0 right-0 z-20 p-4">
            <div className="max-w-6xl mx-auto border-t border-zinc-800 pt-4">
                {error && <div className="mb-2 p-3 bg-red-900/70 text-red-300 border border-red-700 rounded-md text-sm">{error}</div>}
                <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

const ConfigurationError: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center shadow-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-gray-100">Configuration Error</h1>
        <p className="mt-4 text-gray-400">
          The application is missing a required configuration.
        </p>
        <div className="mt-6 text-left bg-zinc-800 p-4 rounded-md">
          <p className="font-semibold text-lg text-gray-200">Missing API Key</p>
          <p className="mt-2 text-gray-400 text-sm">
            The <code className="bg-zinc-700 text-amber-400 px-1 py-0.5 rounded-sm font-mono">API_KEY</code> environment variable is not set. This key is required to communicate with the AI service.
          </p>
          <p className="mt-3 text-gray-400 text-sm">
            Please make sure you have set up your environment variables correctly. If you are developing locally, you might need to create a <code className="bg-zinc-700 text-amber-400 px-1 py-0.5 rounded-sm font-mono">.env</code> file.
          </p>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          After setting the variable, you may need to restart the application.
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return <ConfigurationError />;
  }

  return <AppContent />;
};

export default App;