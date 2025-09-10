import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGallery } from './components/ImageGallery';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { generateImage, editImage, fileToBase64 } from './services/geminiService';
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
      let referenceImages: { data: string; mimeType: string }[] | undefined = undefined;
      
      if (options.files && options.files.length > 0) {
        referenceImages = await Promise.all(
          options.files.map(async (file) => ({
            data: await fileToBase64(file),
            mimeType: file.type,
          }))
        );
      } else if (options.referenceImages && options.referenceImages.length > 0) {
        referenceImages = options.referenceImages;
      }

      if (referenceImages) {
        // Modo de Edição
        const imageUrl = await editImage(prompt, referenceImages);
        const newImage: GeneratedImage = {
          id: new Date().toISOString() + Math.random(),
          url: imageUrl,
          prompt: prompt,
          aspectRatio: aspectRatio,
          referenceImages: referenceImages,
          isFavorite: false,
        };
        setGeneratedImages(prevImages => [newImage, ...prevImages]);
      } else {
        // Modo de Geração
        const imageUrls = await generateImage(prompt, aspectRatio, numberOfImages);
        const newImages: GeneratedImage[] = imageUrls.map(url => ({
          id: new Date().toISOString() + Math.random(),
          url: url,
          prompt: prompt,
          aspectRatio: aspectRatio,
          isFavorite: false,
        }));
        setGeneratedImages(prevImages => [...newImages, ...prevImages]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateVariation = useCallback((image: GeneratedImage) => {
    setSelectedImage(null);
    if (image.referenceImages && image.referenceImages.length > 0) {
        handleGenerate(image.prompt, image.aspectRatio, 1, { referenceImages: image.referenceImages });
    } else {
        // Se não houver imagem de referência, trata-se de uma nova geração a partir do mesmo prompt.
        handleGenerate(image.prompt, image.aspectRatio, 1, {});
    }
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

const App: React.FC = () => {
  return <AppContent />;
};

export default App;