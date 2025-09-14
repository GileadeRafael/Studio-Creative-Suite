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
    <aside className="fixed top-0 left-0 h-full z-30 flex items-center">
      <div className="bg-black/60 backdrop-blur-xl border-r border-zinc-800 h-full p-2.5 flex flex-col items-center gap-2.5 shadow-2xl w-24">
         <div className="mt-4 mb-2">
            <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Studio Logo" className="w-10 h-10"/>
        </div>
        
        <button
          onClick={() => onCreateProject()}
          className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500"
          aria-label="Create new project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <div className="w-full h-px bg-zinc-700 my-2"></div>

        <nav className="space-y-2.5 w-full flex-1 flex-col items-center overflow-y-auto">
          {projects.map(project => (
            <div key={project.id} className="relative w-full flex justify-center group">
              <button
                onClick={() => onSelectProject(project.id!)}
                className={`w-16 h-16 flex items-center justify-center rounded-lg transition-all duration-200 overflow-hidden relative ring-2 ${activeProjectId === project.id ? 'ring-red-600' : 'ring-zinc-700 hover:ring-zinc-500'}`}
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
              </button>

              {/* Hover Info Panel */}
              <div className="absolute left-full ml-3 w-48 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-lg flex items-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-8 h-8 rounded-md overflow-hidden mr-2 flex-shrink-0 bg-zinc-800">
                      {project.images && project.images.length > 0 && <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{project.name}</p>
                      <p className="text-xs text-zinc-400">{project.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'New'}</p>
                  </div>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
