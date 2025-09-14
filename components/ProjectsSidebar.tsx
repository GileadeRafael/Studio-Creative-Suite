import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';

interface ProjectsSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({ projects, activeProjectId, onSelectProject, onCreateProject, onRenameProject, onDeleteProject }) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
        renameInputRef.current.focus();
    }
  }, [renamingId]);

  const handleRenameClick = (project: Project) => {
    setRenamingId(project.id);
    setProjectName(project.name);
    setMenuOpenId(null);
  };

  const handleRenameSubmit = () => {
    if (renamingId && projectName.trim()) {
      onRenameProject(renamingId, projectName.trim());
    }
    setRenamingId(null);
  };

  const handleDeleteClick = (projectId: string) => {
    if (window.confirm("Tem certeza de que deseja excluir este projeto e todas as suas imagens? Esta ação não pode ser desfeita.")) {
        onDeleteProject(projectId);
    }
    setMenuOpenId(null);
  }

  return (
    <aside className="fixed top-1/2 left-4 -translate-y-1/2 z-30">
      <div className="bg-black/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-2.5 flex flex-col items-center gap-2.5 shadow-2xl">
        <button
          onClick={onCreateProject}
          className="w-12 h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500"
          aria-label="Create new project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <div className="w-8 h-px bg-zinc-700"></div>

        <nav className="space-y-2.5 w-full flex flex-col items-center">
          {projects.map(project => (
            <div key={project.id} className="relative w-full flex justify-center group">
              <button
                onClick={() => onSelectProject(project.id)}
                className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all duration-200 overflow-hidden relative ring-2 ${activeProjectId === project.id ? 'ring-red-600' : 'ring-zinc-700 hover:ring-zinc-500'}`}
                aria-label={`Select project: ${project.name}`}
                aria-current={activeProjectId === project.id}
              >
                {project.images.length > 0 ? (
                  <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                )}
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === project.id ? null : project.id); }} 
                className="absolute top-0 right-0 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                aria-label="Project options"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
              </button>
              
              {menuOpenId === project.id && (
                  <div ref={menuRef} className="absolute left-full ml-3 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 py-1">
                      <button onClick={() => handleRenameClick(project)} className="w-full text-left px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700">Rename</button>
                      <button onClick={() => handleDeleteClick(project.id)} className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700">Delete</button>
                  </div>
              )}

              <div className={`absolute left-full ml-3 w-48 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-lg flex items-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${renamingId === project.id && '!opacity-100 pointer-events-auto'}`}>
                  {renamingId === project.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(); }} className="w-full">
                          <input 
                            ref={renameInputRef}
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            className="w-full bg-zinc-700 text-white text-sm rounded-md p-1 focus:ring-2 focus:ring-red-500 outline-none"
                          />
                      </form>
                  ) : (
                    <>
                        <div className="w-8 h-8 rounded-md overflow-hidden mr-2 flex-shrink-0 bg-zinc-800">
                            {project.images.length > 0 && <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{project.name}</p>
                            <p className="text-xs text-zinc-400">{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                        </div>
                    </>
                  )}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};