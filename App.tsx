
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { PromptForm } from './components/PromptForm';
import { ImageGallery } from './components/ImageGallery';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { ConfigurationError } from './components/ConfigurationError';
import { generateImage as generateImageFromApi, editImage, fileToBase64 } from './services/geminiService';
import { GeneratedImage, AspectRatio } from './types';

interface User {
  name: string;
  email: string;
  photoURL: string;
}

interface GenerationOptions {
  files?: File[];
  referenceImages?: { data: string; mimeType: string }[];
}

const decodeJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Error decoding JWT", e);
    return null;
  }
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [galleryView, setGalleryView] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('studio-currentUser');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
        const userImages = localStorage.getItem(`studio-images-${user.email}`);
        if (userImages) {
          setGeneratedImages(JSON.parse(userImages));
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('studio-currentUser');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`studio-images-${currentUser.email}`, JSON.stringify(generatedImages));
    }
  }, [generatedImages, currentUser]);

  const handleLogin = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded: { name: string; email: string; picture: string; } | null = decodeJwt(credentialResponse.credential);
      if (decoded) {
        const user: User = {
          name: decoded.name,
          email: decoded.email,
          photoURL: decoded.picture,
        };
        setCurrentUser(user);
        localStorage.setItem('studio-currentUser', JSON.stringify(user));
        const userImages = localStorage.getItem(`studio-images-${user.email}`);
        setGeneratedImages(userImages ? JSON.parse(userImages) : []);
      }
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      localStorage.setItem(`studio-images-${currentUser.email}`, JSON.stringify(generatedImages));
    }
    setCurrentUser(null);
    setGeneratedImages([]);
    localStorage.removeItem('studio-currentUser');
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

  return (
    <>
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
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
  const clientId = "67218961121-2j1h6tdill2f146tn8os4f05s0jv5euk.apps.googleusercontent.com";
  const apiKey = process.env.VITE_API_KEY;

  if (!apiKey) {
    return <ConfigurationError />;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AppContent />
    </GoogleOAuthProvider>
  );
};

export default App;