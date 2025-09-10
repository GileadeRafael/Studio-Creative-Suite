
import React, { useState } from 'react';
import { UserMenu } from './UserMenu';

interface User {
  name: string;
  photoURL: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onShowLibrary: () => void;
  onShowAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowLibrary, onShowAll }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-20 bg-black/70 backdrop-blur-md border-b border-zinc-800">
          <div className="mx-auto px-6 py-3 flex items-center justify-between">
              <button onClick={onShowAll} className="flex items-center focus:outline-none focus:ring-2 focus:ring-zinc-500 rounded-md">
                  <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Studio Creative Suite Logo" className="w-8 h-8 mr-3" />
                  <h1 className="text-xl font-bold text-white">Studio Creative Suite</h1>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="flex items-center gap-3 rounded-full hover:bg-zinc-800 p-1 pr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-500"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                    <img src={user.photoURL} alt={`Profile picture for ${user.name}`} className="w-8 h-8 rounded-full ring-1 ring-zinc-600"/>
                    <span className="text-white font-medium text-sm hidden sm:block">{user.name}</span>
                </button>
                {isMenuOpen && <UserMenu onLogout={onLogout} onShowLibrary={onShowLibrary} onClose={() => setIsMenuOpen(false)} />}
              </div>
          </div>
      </header>
    )
}
