
import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGallery } from './components/ImageGallery';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ProjectsSidebar } from './components/ProjectsSidebar';
import { SupabaseErrorGuide } from './components/SupabaseErrorGuide';
import { generateImage, editImage, enhanceImage, fileToBase64 } from './services/geminiService';
import { authService } from './services/authService';
import { supabase } from './services/supabaseClient';
import { GeneratedImage, AspectRatio, User, Project } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

interface GenerationOptions {
  files?: File[];
  referenceImages?: { data: string; mimeType: string }[];
}

const API_KEY = process.env.API_KEY;

const EnvVarsChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !API_KEY) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white p-4">
                <div className="w-full max-w-lg rounded-lg bg-zinc-900 p-8 text-center border border-zinc-700 shadow-2xl">
                    <h1 className="text-2xl font-bold text-red-500">Erro de Configuração</h1>
                    <p className="mt-4 text-zinc-300">
                        O aplicativo não está configurado corretamente. Por favor, certifique-se de que as seguintes variáveis de ambiente estejam definidas:
                    </p>
                    <ul className="mt-6 space-y-2 text-left text-zinc-400 bg-zinc-800 p-4 rounded-md">
                        <li className="font-mono flex items-center">{SUPABASE_URL ? '✅' : '❌'} <span className="ml-3">VITE_SUPABASE_URL</span></li>
                        <li className="font-mono flex items-center">{SUPABASE_ANON_KEY ? '✅' : '❌'} <span className="ml-3">VITE_SUPABASE_ANON_KEY</span></li>
                        <li className="font-mono flex items-center">{API_KEY ? '✅' : '❌'} <span className="ml-3">API_KEY</span></li>
                    </ul>
                    <p className="mt-6 text-sm text-zinc-500">
                        Essas variáveis devem ser definidas em um arquivo <code>.env</code> na raiz do projeto. Após adicioná-las, pode ser necessário reiniciar o servidor de desenvolvimento.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup' | 'app'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Começa como true
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [galleryView, setGalleryView] = useState<'all' | 'favorites'>('all');
  const [supabaseCorsError, setSupabaseCorsError] = useState<boolean>(false);

  // Gerencia a sessão do usuário e carrega os dados
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            username: session.user.user_metadata.username,
            photoURL: session.user.user_metadata.photo_url,
          };
          await handleLogin(user);
          setView('app');
        } else {
          setCurrentUser(null);
          setProjects([]);
          setActiveProjectId(null);
          setView('login');
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Garante que um projeto ativo seja selecionado se o atual for removido
  useEffect(() => {
      if (activeProjectId && !projects.find(p => p.id === activeProjectId)) {
          if (projects.length > 0) {
              setActiveProjectId(projects[0].id);
          } else {
             handleCreateProject();
          }
      }
  }, [projects, activeProjectId]);

  const handleSupabaseError = (fetchError: any, context: string): string => {
    console.error(`Supabase error during ${context}:`, fetchError);
  
    if (fetchError.message.includes('Failed to fetch')) {
      setSupabaseCorsError(true);
      return `Erro de Conexão (CORS): Não foi possível conectar ao Supabase. Verifique se o domínio do aplicativo está adicionado às "Allowed Origins (CORS)" nas configurações da API do seu projeto Supabase.`;
    }
  
    const isPermissionsError = fetchError.code === '42501' || (fetchError.message && (fetchError.message.includes('permission denied') || fetchError.message.includes('policy') || fetchError.message.includes('RLS')));
    if (isPermissionsError) {
      return `Erro de permissão no banco de dados. Verifique se as políticas de RLS (Row Level Security) estão configuradas corretamente no Supabase para permitir ${context}.`;
    }
    
    let errorMessage = `Erro ao ${context}: ${fetchError.message || 'Ocorreu um erro de banco de dados desconhecido.'}`;
    if (fetchError.details) errorMessage += `\nDetalhes: ${fetchError.details}`;
    if (fetchError.hint) errorMessage += `\nHINT: ${fetchError.hint}`;
    
    return errorMessage;
  };

  const fetchUserProjects = async (userId: string) => {
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('*, images(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('created_at', { foreignTable: 'images', ascending: false });

    if (fetchError) {
      setError(handleSupabaseError(fetchError, "carregar projetos"));
      return [];
    }
    return data || [];
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    const userProjects = await fetchUserProjects(user.id);

    if (userProjects.length === 0 && !error) { // Apenas cria se não houver erro de carregamento
        const newProject = await handleCreateProject(true);
        if(newProject) {
            setProjects([newProject]);
            setActiveProjectId(newProject.id!);
        }
    } else {
        setProjects(userProjects);
        setActiveProjectId(userProjects[0]?.id || null);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
  };
  
  const handleGenerate = useCallback(async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number, options: GenerationOptions) => {
    if (!activeProjectId || !currentUser) {
        setError("Nenhum projeto ativo selecionado. Por favor, crie ou selecione um projeto primeiro.");
        return;
    }
    setIsLoading(true);
    setError(null);

    const activeProject = projects.find(p => p.id === activeProjectId);

    try {
      let imagesData: Omit<GeneratedImage, 'id' | 'created_at' | 'user_id'>[] = [];
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
        const imageUrl = await editImage(prompt, referenceImages);
        imagesData.push({
          url: imageUrl,
          prompt,
          aspectRatio,
          referenceImages,
          isFavorite: false,
          isEnhanced: false,
          project_id: activeProjectId,
        });
      } else {
        const imageUrls = await generateImage(prompt, aspectRatio, numberOfImages);
        imagesData = imageUrls.map(url => ({
          url,
          prompt,
          aspectRatio,
          isFavorite: false,
          isEnhanced: false,
          project_id: activeProjectId,
        }));
      }

      const { data: newImages, error: insertError } = await supabase
        .from('images')
        .insert(imagesData.map(img => ({...img, user_id: currentUser.id})))
        .select();

      if (insertError || !newImages) {
        throw new Error(insertError?.message || "Failed to save new images.");
      }
      
      const isDefaultName = activeProject && (activeProject.name.startsWith('Project ') || activeProject.name === 'My First Project');
      const shouldUpdateName = isDefaultName && activeProject.images.length === 0;
      let newName = activeProject?.name;

      if (shouldUpdateName) {
        newName = prompt.split(' ').slice(0, 4).join(' ');
        await handleUpdateProjectName(activeProjectId, newName);
        // The state update is handled by handleUpdateProjectName, so we just need the new name for the current operation
      }

      setProjects(prevProjects => prevProjects.map(p => 
          p.id === activeProjectId
              ? { ...p, name: shouldUpdateName ? (newName || p.name) : p.name, images: [...newImages, ...p.images] }
              : p
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, projects, currentUser]);

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

        const { data: updatedImageData, error: updateError } = await supabase
            .from('images')
            .update({ enhancedUrl: enhancedImageUrl, isEnhanced: true })
            .eq('id', image.id)
            .select()
            .single();

        if (updateError || !updatedImageData) {
            throw new Error(updateError?.message || "Failed to save enhanced image.");
        }

        const updatedImage: GeneratedImage = updatedImageData;

        setProjects(prevProjects => prevProjects.map(p =>
            p.id === activeProjectId
                ? { ...p, images: p.images.map(img => img.id === image.id ? updatedImage : img) }
                : p
        ));
        
        setSelectedImage(updatedImage);

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during enhancement.');
        console.error(err);
    } finally {
        setIsEnhancing(false);
    }
  }, [activeProjectId]);

  const handleDeleteImage = useCallback(async (id: string) => {
    if (!activeProjectId) return;

    const originalProjects = projects;
    const projectToUpdate = originalProjects.find(p => p.id === activeProjectId);
    if (!projectToUpdate) return;

    const updatedImages = projectToUpdate.images.filter(img => img.id !== id);
    const shouldDeleteProject = updatedImages.length === 0;

    // Optimistically update UI
    if (shouldDeleteProject) {
        setProjects(prev => prev.filter(p => p.id !== activeProjectId));
    } else {
        setProjects(prev => prev.map(p =>
            p.id === activeProjectId ? { ...p, images: updatedImages } : p
        ));
    }
    
    // Perform DB operations
    const { error: deleteImageError } = await supabase.from('images').delete().eq('id', id);

    if (deleteImageError) {
        setError(`Failed to delete image: ${deleteImageError.message}`);
        setProjects(originalProjects); // Revert on failure
        return;
    }

    if (shouldDeleteProject) {
        const { error: deleteProjectError } = await supabase
            .from('projects')
            .delete()
            .eq('id', activeProjectId);
        
        if (deleteProjectError) {
            setError(`Image deleted, but failed to delete empty project: ${deleteProjectError.message}`);
            // Don't revert here as the image is already gone. The app state is mostly correct,
            // but an empty project might reappear on next full refresh. The error message is key.
        }
    }
  }, [activeProjectId, projects]);

  const handleToggleFavorite = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === activeProjectId);
    const image = project?.images.find(img => img.id === id);
    if (!image) return;

    const newIsFavorite = !image.isFavorite;

    const { error } = await supabase
      .from('images')
      .update({ is_favorite: newIsFavorite })
      .eq('id', id);

    if (error) {
      setError("Failed to update favorite status.");
      return;
    }

    setProjects(prevProjects => prevProjects.map(p =>
        p.id === activeProjectId
            ? { ...p, images: p.images.map(img => img.id === id ? { ...img, isFavorite: newIsFavorite } : img) }
            : p
    ));
  }, [activeProjectId, projects]);

  const handleCreateProject = useCallback(async (returnOnly = false): Promise<Project | undefined> => {
    if (!currentUser || isCreatingProject) return;

    if (!returnOnly) {
      setIsCreatingProject(true);
      setError(null);
    }

    try {
      const isFirstProject = projects.length === 0;
      const newProjectData = {
        name: isFirstProject ? 'My First Project' : `Project ${projects.length + 1}`,
        user_id: currentUser.id,
      };

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert(newProjectData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      if (!data) {
        throw new Error("Failed to create a new project: no data returned.");
      }

      const newProject: Project = { ...data, images: [] };

      if (returnOnly) {
        return newProject;
      }

      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id!);
      return newProject;

    } catch (err: any) {
      setError(handleSupabaseError(err, "criar projeto"));
    } finally {
      if (!returnOnly) {
        setIsCreatingProject(false);
      }
    }
  }, [projects, currentUser, isCreatingProject]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!window.confirm("Tem certeza de que deseja excluir este projeto e todas as suas imagens? Esta ação é permanente.")) {
        return;
    }
    
    const originalProjects = [...projects];

    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== projectId));

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        setError(`Failed to delete project: ${error.message}`);
        setProjects(originalProjects); // Revert on failure
        console.error("Failed to delete project:", error);
    }
  }, [projects]);


  const handleUpdateProjectName = async (projectId: string, newName: string) => {
    if (!newName.trim()) {
        setError("Project name cannot be empty.");
        return;
    }
    
    const originalProjects = [...projects];
    
    // Optimistic update
    setProjects(prevProjects => prevProjects.map(p =>
        p.id === projectId ? { ...p, name: newName.trim() } : p
    ));
    
    const { error: updateError } = await supabase
        .from('projects')
        .update({ name: newName.trim() })
        .eq('id', projectId);
        
    if (updateError) {
        setError(`Failed to rename project: ${updateError.message}`);
        setProjects(originalProjects); // Revert on failure
        console.error("Failed to update project name:", updateError);
    }
  };


  const handleSelectProject = useCallback((id: string) => {
    setActiveProjectId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);
  
  if (supabaseCorsError) {
    return <SupabaseErrorGuide />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (view === 'login') {
    return <LoginPage onNavigateToSignup={() => setView('signup')} />;
  }
  if (view === 'signup') {
    return <SignupPage onNavigateToLogin={() => setView('login')} />;
  }

  const activeProject = projects.find(p => p.id === activeProjectId);
  const allImages = activeProject ? activeProject.images : [];
  const galleryImages = galleryView === 'favorites' ? allImages.filter(img => img.isFavorite) : allImages;

  return (
    <>
      {currentUser && (
        <div className="flex h-screen bg-black text-gray-100">
          <ProjectsSidebar 
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
          <div className="flex flex-col flex-1 pl-28">
            {isLoading && <Loader />}
            {selectedImage && (
              <Modal 
                image={selectedImage}
                galleryImages={allImages}
                onImageChange={setSelectedImage} 
                onClose={handleCloseModal} 
                onCreateVariation={handleCreateVariation}
                onEnhance={handleEnhanceImage}
                isEnhancing={isEnhancing}
              />
            )}
            
            <Header 
              user={currentUser}
              onLogout={handleLogout}
              onShowLibrary={() => setGalleryView('favorites')}
              onShowAll={() => setGalleryView('all')}
              activeProject={activeProject}
              onUpdateProjectName={handleUpdateProjectName}
            />

            <main className="flex-1 overflow-y-auto pt-20 pb-40 px-6 md:px-8 lg:px-10">
              <ImageGallery 
                images={galleryImages} 
                onImageSelect={setSelectedImage}
                onDelete={handleDeleteImage}
                onToggleFavorite={handleToggleFavorite}
                view={galleryView}
              />
            </main>

            <footer className="fixed bottom-0 left-28 right-0 z-20 p-4">
              <div className="max-w-6xl mx-auto border-t border-zinc-800 pt-4">
                  {error && <div className="mb-2 p-3 bg-red-900/70 text-red-300 border border-red-700 rounded-md text-sm whitespace-pre-wrap">{error}</div>}
                  <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <EnvVarsChecker>
      <AppContent />
    </EnvVarsChecker>
  );
};

export default App;
