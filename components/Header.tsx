
import React, { useState, useEffect, useRef } from 'react';
import { UserMenu } from './UserMenu';
import { User, Project } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onShowLibrary: () => void;
  onShowAll: () => void;
  activeProject: Project | undefined;
  onUpdateProjectName: (projectId: string, newName: string) => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowLibrary, onShowAll, activeProject, onUpdateProjectName }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [projectName, setProjectName] = useState(activeProject?.name || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeProject) {
            setProjectName(activeProject.name);
        }
    }, [activeProject]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (projectName.trim() && activeProject && projectName.trim() !== activeProject.name) {
            onUpdateProjectName(activeProject.id!, projectName.trim());
        } else if (activeProject) {
            setProjectName(activeProject.name); // Revert if empty or unchanged
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setProjectName(activeProject?.name || '');
            setIsEditing(false);
        }
    };

    return (
        <header className="fixed top-0 left-28 right-0 z-20 bg-black/70 backdrop-blur-md border-b border-zinc-800">
          <div className="mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Logo" className="w-8 h-8 flex-shrink-0" />
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="text-xl font-bold text-white bg-transparent border-b-2 border-zinc-500 focus:outline-none focus:border-red-500 transition-colors w-full"
                    />
                ) : (
                    <div onClick={() => setIsEditing(true)} className="flex items-center gap-2 cursor-pointer group min-w-0">
                        <h1 className="text-xl font-bold text-white truncate" title={activeProject?.name}>{activeProject?.name || 'Loading Project...'}</h1>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="flex items-center gap-3 rounded-full hover:bg-zinc-800 p-1 pr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                    <img src={user.photoURL} alt={`Profile picture for ${user.username}`} className="w-8 h-8 rounded-full ring-1 ring-zinc-600 object-cover"/>
                    <span className="text-white font-medium text-sm hidden sm:block">{user.username}</span>
                </button>
                {isMenuOpen && <UserMenu onLogout={onLogout} onShowLibrary={onShowLibrary} onClose={() => setIsMenuOpen(false)} />}
              </div>
          </div>
      </header>
    )
}
