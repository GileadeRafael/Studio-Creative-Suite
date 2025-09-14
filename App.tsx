import React, { useState, useEffect, useCallback } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGallery } from './components/ImageGallery';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { SupabaseErrorGuide } from './components/SupabaseErrorGuide';
import { generateImage, editImage, enhanceImage, fileToBase64 } from './services/geminiService';
import { authService } from './services/authService';
import { supabase } from './services/supabaseClient';
import { GeneratedImage, AspectRatio, User, Project } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const API_KEY = process.env.API_KEY;

interface GenerationOptions {
  files?: File[];
  referenceImages?: { data: string; mimeType: string }[];
}

const EnvVarsChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white p-4">
                <div className="w-full max-w-lg rounded-lg bg-zinc-900 p-8 text-center border border-zinc-700 shadow-2xl">
                    <h1 className="text-2xl font-bold text-red-500">Erro de Configuração</h1>
                    <p className="mt-4 text-zinc-300">
                        O aplicativo não está configurado corretamente. Por favor, certifique-se de que as seguintes variáveis de ambiente ou configurações estejam definidas:
                    </p>
                    <ul className="mt-6 space-y-2 text-left text-zinc-400 bg-zinc-800 p-4 rounded-md">
                        <li className="font-mono flex items-center">{API_KEY ? '✅' : '❌'} <span className="ml-3">API_KEY</span></li>
                        <li className="font-mono flex items-center">{SUPABASE_URL ? '✅' : '❌'} <span className="ml-3">SUPABASE_URL</span></li>
                        <li className="font-mono flex items-center">{SUPABASE_ANON_KEY ? '✅' : '❌'} <span className="ml-3">SUPABASE_ANON_KEY</span></li>
                    </ul>
                    <p className="mt-6 text-sm text-zinc-500">
                        Estas variáveis são necessárias para a funcionalidade do aplicativo.
                    </p>
                </div>
            </div>
        );
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    const [view, setView] = useState<'loading' | 'login' | 'signup' | 'app'>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [defaultProject, setDefaultProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [galleryView, setGalleryView] = useState<'all' | 'favorites'>('all');
    const [supabaseCorsError, setSupabaseCorsError] = useState(false);

    const fetchImages = useCallback(async (projectId: string) => {
        const { data, error } = await supabase
            .from('images')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching images:", error.message);
            setError(`Failed to load your images: ${error.message}`);
        } else if (data) {
            setImages(data as GeneratedImage[]);
        }
    }, []);

    useEffect(() => {
        const handleLogin = async (user: User) => {
            setUser(user);
            setView('app');
            setIsLoading(true);

            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (projectsError) {
                console.error("Error fetching projects:", projectsError.message);
                setError(`Failed to load project data: ${projectsError.message}`);
                setIsLoading(false);
                return;
            }

            let projectToUse: Project | null = null;
            if (projects && projects.length > 0) {
                projectToUse = projects[0];
            } else {
                const { data: newProject, error: createError } = await supabase
                    .from('projects')
                    .insert({ name: 'My Gallery', user_id: user.id })
                    .select('*')
                    .single();
                
                if (createError) {
                    console.error("Error creating default project:", createError.message);
                    setError(`Failed to create a project for your account: ${createError.message}`);
                    setIsLoading(false);
                    return;
                }
                projectToUse = newProject;
            }
            
            if (projectToUse) {
                setDefaultProject(projectToUse);
                await fetchImages(projectToUse.id);
            } else {
                setError("Could not find or create a project for your account.");
            }
            setIsLoading(false);
        };
        
        const checkUser = async () => {
          try {
              const currentUser = await authService.getCurrentUser();
              if (currentUser) {
                  await handleLogin(currentUser);
              } else {
                  setView('login');
                  setIsLoading(false);
              }
          } catch (error: any) {
              if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                  setSupabaseCorsError(true);
              } else {
                  console.error("Authentication error:", error);
                  setError("An error occurred during authentication.");
              }
              setView('login'); // Fallback
              setIsLoading(false);
          }
        };

        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const sessionUser = session?.user;
            if (sessionUser) {
                await handleLogin({
                    id: sessionUser.id,
                    email: sessionUser.email!,
                    username: sessionUser.user_metadata.username,
                    photoURL: sessionUser.user_metadata.photo_url,
                });
            } else {
                setUser(null);
                setDefaultProject(null);
                setView('login');
                setImages([]);
            }
        });

        return () => authListener.subscription.unsubscribe();
    }, [fetchImages]);
    
    const handleLogout = async () => {
        await authService.logout();
    };

    const handleGenerate = useCallback(async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number, options: GenerationOptions) => {
        if (!user || !defaultProject) {
            setError("User session or project not found. Please try logging in again.");
            return;
        }
        setIsGenerating(true);
        setError(null);

        try {
            let newImagesData: Omit<GeneratedImage, 'id' | 'user_id' | 'project_id'>[] = [];
            let referenceImages: { data: string; mimeType: string }[] | undefined = undefined;

            if (options.files && options.files.length > 0) {
                referenceImages = await Promise.all(
                    options.files.map(async (file) => ({ data: await fileToBase64(file), mimeType: file.type }))
                );
            } else if (options.referenceImages && options.referenceImages.length > 0) {
                referenceImages = options.referenceImages;
            }

            if (referenceImages) {
                const imageUrl = await editImage(prompt, referenceImages);
                newImagesData.push({ url: imageUrl, prompt, aspectRatio, referenceImages, isFavorite: false, isEnhanced: false });
            } else {
                const imageUrls = await generateImage(prompt, aspectRatio, numberOfImages);
                newImagesData = imageUrls.map(url => ({ url, prompt, aspectRatio, isFavorite: false, isEnhanced: false }));
            }
            
            const imagesToSave = newImagesData.map(img => ({
                ...img,
                id: self.crypto.randomUUID(),
                user_id: user.id,
                project_id: defaultProject.id,
            }));

            const { data: savedImages, error: dbError } = await supabase.from('images').insert(imagesToSave).select();

            if (dbError) throw dbError;
            
            if(savedImages) {
              setImages(prev => [...savedImages, ...prev]);
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }, [user, defaultProject]);

    const handleCreateVariation = useCallback((image: GeneratedImage) => {
        setSelectedImage(null);
        if (image.referenceImages && image.referenceImages.length > 0) {
            handleGenerate(image.prompt, image.aspectRatio, 1, { referenceImages: image.referenceImages });
        } else {
            handleGenerate(image.prompt, image.aspectRatio, 1, {});
        }
    }, [handleGenerate]);
    
    const handleEnhanceImage = useCallback(async (image: GeneratedImage) => {
        if (!image.id) return;
        setIsEnhancing(true);
        setError(null);
        try {
            const dataUrlParts = image.url.split(',');
            const mimeType = dataUrlParts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const data = dataUrlParts[1];
            const enhancedImageUrl = await enhanceImage({ data, mimeType });
            
            const { error: dbError } = await supabase.from('images').update({ enhancedUrl: enhancedImageUrl, isEnhanced: true }).eq('id', image.id);
            if(dbError) throw dbError;

            const updatedImage: GeneratedImage = { ...image, enhancedUrl: enhancedImageUrl, isEnhanced: true };
            
            setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));
            setSelectedImage(updatedImage);
        } catch (err: any) {
            const errorMessage = err?.message || 'An unknown error occurred during enhancement.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsEnhancing(false);
        }
    }, []);

    const handleDeleteImage = useCallback(async (id: string) => {
        const originalImages = images;
        setImages(prev => prev.filter(img => img.id !== id));
        const { error: dbError } = await supabase.from('images').delete().eq('id', id);
        if (dbError) {
            setError(`Failed to delete image: ${dbError.message}`);
            setImages(originalImages);
        }
    }, [images]);

    const handleToggleFavorite = useCallback(async (id: string) => {
        const image = images.find(i => i.id === id);
        if (!image) return;
        const newFavoriteState = !image.isFavorite;

        setImages(prev => prev.map(img => img.id === id ? { ...img, isFavorite: newFavoriteState } : img));
        const { error: dbError } = await supabase.from('images').update({ isFavorite: newFavoriteState }).eq('id', id);
        if (dbError) {
            setError(`Failed to update favorite status: ${dbError.message}`);
            setImages(prev => prev.map(img => img.id === id ? { ...img, isFavorite: image.isFavorite } : img));
        }
    }, [images]);

    const galleryImages = galleryView === 'favorites' ? images.filter(img => img.isFavorite) : images;

    if (supabaseCorsError) return <SupabaseErrorGuide />;

    const appContent = (
      <div className="flex h-screen bg-black text-gray-100">
          <div className="flex flex-col flex-1">
              {(isGenerating && !selectedImage) && <Loader />}
              {selectedImage && (
                  <Modal
                      image={selectedImage}
                      galleryImages={images}
                      onImageChange={setSelectedImage}
                      onClose={() => setSelectedImage(null)}
                      onCreateVariation={handleCreateVariation}
                      onEnhance={handleEnhanceImage}
                      isEnhancing={isEnhancing}
                  />
              )}
              <Header 
                  user={user}
                  onLogout={handleLogout}
                  onShowLibrary={() => setGalleryView('favorites')}
                  onShowAll={() => setGalleryView('all')}
                  galleryView={galleryView}
              />
              <main className="flex-1 overflow-y-auto pt-20 pb-40 px-6 md:px-8 lg:px-10">
                  {isLoading ? (
                      <div className="flex justify-center items-center h-full"><Loader /></div>
                  ) : (
                      <ImageGallery
                          images={galleryImages}
                          onImageSelect={setSelectedImage}
                          onDelete={handleDeleteImage}
                          onToggleFavorite={handleToggleFavorite}
                          view={galleryView}
                      />
                  )}
              </main>
              <footer className="fixed bottom-0 left-0 right-0 z-20 p-4">
                  <div className="max-w-6xl mx-auto border-t border-zinc-800 pt-4">
                      {error && <div className="mb-2 p-3 bg-red-900/70 text-red-300 border border-red-700 rounded-md text-sm whitespace-pre-wrap">{error}</div>}
                      <PromptForm onGenerate={handleGenerate} isLoading={isGenerating} />
                  </div>
              </footer>
          </div>
      </div>
    );
    
    return (
        <EnvVarsChecker>
          {view === 'loading' && <div className="fixed inset-0 bg-black flex items-center justify-center"><Loader /></div>}
          {view === 'login' && <LoginPage onNavigateToSignup={() => setView('signup')} />}
          {view === 'signup' && <SignupPage onNavigateToLogin={() => setView('login')} />}
          {view === 'app' && user && appContent}
        </EnvVarsChecker>
    );
};

export default App;
