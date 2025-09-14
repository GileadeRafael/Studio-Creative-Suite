import React, { useState } from 'react';
import { User } from '../types';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onShowLibrary: () => void;
  onShowAll: () => void;
  galleryView: 'all' | 'favorites';
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowLibrary, onShowAll, galleryView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-20 bg-black/70 backdrop-blur-md border-b border-zinc-800">
          <div className="mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Logo" className="w-8 h-8" />
                <div className="h-6 w-px bg-zinc-700"></div>
                <h1 className="text-xl font-bold text-white">Studio Creative Suite</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button 
                      onClick={onShowAll}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${galleryView === 'all' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                    >
                      All Generations
                    </button>
                    <button
                      onClick={onShowLibrary}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${galleryView === 'favorites' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${galleryView === 'favorites' ? 'text-red-500' : 'text-zinc-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Library
                    </button>
                </div>
                <div className="h-6 w-px bg-zinc-700"></div>
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(s => !s)} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500 rounded-full">
                        <span className="text-white text-sm font-medium hidden sm:block">{user?.username}</span>
                        <img src={user?.photoURL} alt={user?.username} className="w-8 h-8 rounded-full bg-zinc-700 object-cover"/>
                    </button>
                    {isMenuOpen && (
                        <UserMenu
                            onLogout={onLogout}
                            onShowLibrary={() => { onShowLibrary(); setIsMenuOpen(false); }}
                            onClose={() => setIsMenuOpen(false)}
                        />
                    )}
                </div>
              </div>
          </div>
      </header>
    )
}