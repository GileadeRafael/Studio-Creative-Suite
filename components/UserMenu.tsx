
import React, { useState, useEffect, useRef } from 'react';

interface UserMenuProps {
  onLogout: () => void;
  onShowLibrary: () => void;
  onClose: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout, onShowLibrary, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={menuRef} className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-30">
      <ul className="py-1">
        <li>
          <button
            onClick={() => { onShowLibrary(); onClose(); }}
            className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Image Library
          </button>
        </li>
        <li>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
};
