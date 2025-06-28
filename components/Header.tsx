import React from 'react';
import { Settings } from 'lucide-react';
import { UserAccount } from '../types';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  currentUser: UserAccount | null;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onOpenSettings }) => {
  return (
    <header className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-1/3">
            {currentUser && (
              <button 
                onClick={onOpenSettings} 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open Settings"
              >
                <Settings className="h-6 w-6" />
              </button>
            )}
          </div>
          <div className="w-1/3 flex justify-center items-center space-x-3">
             {/* Title can be dynamically inserted here if needed later */}
          </div>
          <div className="w-1/3 flex justify-end">
            {currentUser && (
              <div className="flex items-center space-x-3 animate-fade-in">
                <span className="text-gray-700 dark:text-gray-300 font-medium hidden sm:inline">{currentUser.name}</span>
                <UserAvatar name={currentUser.name} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
