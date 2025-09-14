import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageGallery } from './components/ImageGallery';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ProjectsSidebar } from './components/ProjectsSidebar';
import { generateImage, editImage, enhanceImage, fileToBase64 } from './services/geminiService';
import { authService } from './services/authService';
import { GeneratedImage, AspectRatio, User, Project } from './types';

interface GenerationOptions {
  files?: File[];
  referenceImages?: { data: string; mimeType: string }[];
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup' | 'app'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
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
    if (currentUser && projects.length > 0) {
      try {
        localStorage.setItem(`studio-projects-${currentUser.email}`, JSON.stringify(projects));
      } catch (e) {
        console.error("Failed to save projects to localStorage. Data might be too large.", e);
        setError("Could not save the new data to the browser's storage, it might be full.");
      }
    }
  }, [projects, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    let userProjects: Project[] = [];
    const projectsData = localStorage.getItem(`studio-projects-${user.email}`);

    if (projectsData) {
        userProjects = JSON.parse(projectsData);
    } else {
        const oldImagesData = localStorage.getItem(`studio-images-${user.email}`);
        if (oldImagesData) {
            const oldImages = JSON.parse(oldImagesData);
            if (oldImages.length > 0) {
                const migratedProject: Project = {
                    id: `proj-${Date.now()}`,
                    name: 'Migrated Project',
                    images: oldImages,
                    createdAt: new Date().toISOString(),
                };
                userProjects.push(migratedProject);
            }
            localStorage.removeItem(`studio-images-${user.email}`);
        }
    }

    if (userProjects.length === 0) {
        const defaultProject: Project = {
            id: `proj-${Date.now()}`,
            name: 'My First Project',
            images: [],
            createdAt: new Date().toISOString(),
        };
        userProjects.push(defaultProject);
    }

    userProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setProjects(userProjects);
    setActiveProjectId(userProjects[0]?.id || null);
    setView('app');
  };

  const handleLogout = () => {
    if (currentUser) {
        localStorage.setItem(`studio-projects-${currentUser.email}`, JSON.stringify(projects));
    }
    authService.logout();
    setCurrentUser(null);
    setProjects([]);
    setActiveProjectId(null);
    setView('login');
  };
  
  const handleGenerate = useCallback(async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number, options: GenerationOptions) => {
    if (!activeProjectId) {
        setError("No active project selected. Please create or select a project first.");
        return;
    }
    setIsLoading(true);
    setError(null);

    const activeProject = projects.find(p => p.id === activeProjectId);

    try {
      let imagesToAdd: GeneratedImage[] = [];
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
        imagesToAdd.push({
          id: new Date().toISOString() + Math.random(),
          url: imageUrl,
          prompt: prompt,
          aspectRatio: aspectRatio,
          referenceImages: referenceImages,
          isFavorite: false,
          isEnhanced: false,
        });
      } else {
        const imageUrls = await generateImage(prompt, aspectRatio, numberOfImages);
        imagesToAdd = imageUrls.map(url => ({
          id: new Date().toISOString() + Math.random(),
          url: url,
          prompt: prompt,
          aspectRatio: aspectRatio,
          isFavorite: false,
          isEnhanced: false,
        }));
      }

      setProjects(prevProjects => {
          const isDefaultName = activeProject && (activeProject.name.startsWith('Project ') || activeProject.name === 'My First Project' || activeProject.name === 'Migrated Project');
          const shouldUpdateName = isDefaultName && activeProject.images.length === 0;
          const newName = shouldUpdateName ? prompt.split(' ').slice(0, 4).join(' ') + '...' : activeProject?.name;

          return prevProjects.map(p => 
              p.id === activeProjectId
                  ? { ...p, name: newName || p.name, images: [...imagesToAdd, ...p.images] }
                  : p
          );
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, projects]);

  const handleCreateVariation = useCallback((image: GeneratedImage) => {
    setSelectedImage(null);
    if (image.referenceImages && image.referenceImages.length > 0) {
        handleGenerate(image.prompt, image.aspectRatio, 1, { referenceImages: image.referenceImages });
    } else {
        handleGenerate(image.prompt, image.aspectRatio, 1, {});
    }
  }, [handleGenerate]);

  const handleEnhanceImage = useCallback(async (image: GeneratedImage) => {
    setIsEnhancing(true);
    setError(null);
    try {
        const dataUrlParts = image.url.split(',');
        const mimeType = dataUrlParts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const data = dataUrlParts[1];
        
        const enhancedImageUrl = await enhanceImage({ data, mimeType });

        const updatedImage: GeneratedImage = { 
            ...image, 
            enhancedUrl: enhancedImageUrl, 
            isEnhanced: true 
        };

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


  const handleDeleteImage = useCallback((id: string) => {
    setProjects(prevProjects => prevProjects.map(p =>
        p.id === activeProjectId
            ? { ...p, images: p.images.filter(img => img.id !== id) }
            : p
    ));
  }, [activeProjectId]);

  const handleToggleFavorite = useCallback((id: string) => {
    setProjects(prevProjects => prevProjects.map(p =>
        p.id === activeProjectId
            ? { ...p, images: p.images.map(img => img.id === id ? { ...img, isFavorite: !img.isFavorite } : img) }
            : p
    ));
  }, [activeProjectId]);

  const handleCreateProject = useCallback(() => {
    const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: `Project ${projects.length + 1}`,
        images: [],
        createdAt: new Date().toISOString(),
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setActiveProjectId(newProject.id);
  }, [projects]);

  const handleSelectProject = useCallback((id: string) => {
    setActiveProjectId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setView('signup')} />;
  }
  if (view === 'signup') {
    return <SignupPage onSignup={handleLogin} onNavigateToLogin={() => setView('login')} />;
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
          />
          <div className="flex flex-col flex-1">
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

            <footer className="fixed bottom-0 left-0 right-0 z-20 p-4">
              <div className="max-w-6xl mx-auto border-t border-zinc-800 pt-4">
                  {error && <div className="mb-2 p-3 bg-red-900/70 text-red-300 border border-red-700 rounded-md text-sm">{error}</div>}
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
  return <AppContent />;
};

export default App;