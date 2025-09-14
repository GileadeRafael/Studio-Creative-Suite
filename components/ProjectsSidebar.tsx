import React from 'react';
import { Project } from '../types';

interface ProjectsSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
}

export const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({ projects, activeProjectId, onSelectProject, onCreateProject }) => {
  return (
    <aside className="fixed top-1/2 left-4 -translate-y-1/2 z-30">
      <div className="bg-black/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-2.5 flex flex-col items-center gap-2.5 shadow-2xl">
        <button
          onClick={onCreateProject}
          className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500"
          aria-label="Create new project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <div className="w-8 h-px bg-zinc-700"></div>
        
        <button className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500" aria-label="Image gallery">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        <div className="w-8 h-px bg-zinc-700"></div>

        <nav className="space-y-2.5 w-full flex flex-col items-center">
          {projects.map(project => (
            <div key={project.id} className="relative w-full flex justify-center group">
              <button
                onClick={() => onSelectProject(project.id)}
                className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all duration-200 overflow-hidden relative ring-2 ${activeProjectId === project.id ? 'ring-white' : 'ring-zinc-700 hover:ring-zinc-500'}`}
                aria-label={`Select project: ${project.name}`}
              >
                {project.images.length > 0 ? (
                  <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                )}
              </button>
              {activeProjectId === project.id && (
                  <div className="absolute left-full ml-3 w-48 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-lg flex items-center pointer-events-none z-10">
                      <div className="w-8 h-8 rounded-md overflow-hidden mr-2 flex-shrink-0 bg-zinc-800">
                          {project.images.length > 0 && <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="overflow-hidden">
                          <p className="text-sm font-medium text-white truncate">{project.name}</p>
                          <p className="text-xs text-zinc-400">{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                  </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};