
import React from 'react';
import { Project } from '../types';

interface ProjectsSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({ projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject }) => {
  
  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Previne que onSelectProject seja chamado
    onDeleteProject(projectId);
  };

  return (
    <aside className="fixed top-0 left-0 h-full z-30 flex flex-col items-center justify-center p-4">
      <div className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 h-auto max-h-[90vh] py-4 px-2 flex flex-col items-center gap-2 shadow-2xl w-20 rounded-3xl">
        <button
          onClick={onCreateProject}
          className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all duration-300 ease-in-out group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500"
          aria-label="Create new project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
          </svg>
        </button>

        <div className="w-8 h-px bg-zinc-700 my-1 flex-shrink-0"></div>

        <nav className="w-full flex-1 flex flex-col items-center gap-3 overflow-y-auto no-scrollbar pt-1">
          {projects.map(project => (
            <div key={project.id} className="relative w-full flex justify-center group flex-shrink-0">
              <button
                onClick={() => onSelectProject(project.id!)}
                className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-200 overflow-hidden relative focus:outline-none ${activeProjectId === project.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:ring-2 hover:ring-zinc-500'}`}
                aria-label={`Select project: ${project.name}`}
                aria-current={activeProjectId === project.id}
              >
                {project.images && project.images.length > 0 ? (
                  <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                )}
                {project.images && project.images.length > 0 && (
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm ring-1 ring-white/20">
                    {project.images.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={(e) => handleDelete(e, project.id!)}
                className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 border border-zinc-700"
                aria-label={`Delete project ${project.name}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>

              {/* Hover Info Panel */}
              <div className="absolute left-full ml-4 w-52 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 shadow-lg flex items-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300">
                  <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0 bg-zinc-800">
                      {project.images && project.images.length > 0 ? (
                        <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{project.name}</p>
                      <p className="text-xs text-zinc-400">{project.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'New'}</p>
                  </div>
              </div>
            </div>
          ))}
        </nav>
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      </div>
    </aside>
  );
};
