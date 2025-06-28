import React from 'react';
import { UserAccount, TodaysThought, Friend } from '../types';
import { X, LogOut, Download } from 'lucide-react';
import { useInstall } from '../contexts/InstallContext';
import UserAvatar from './UserAvatar';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onLogout: () => void;
  friendCount: number;
  latestThought: TodaysThought | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onLogout, friendCount, latestThought }) => {
  const { installPrompt, canInstall } = useInstall();
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 relative animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close settings"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center -mt-16">
            <UserAvatar name={user.name} size="lg" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-4">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center my-6">
            <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{friendCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Friends</p>
            </div>
             <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{latestThought ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thought Today</p>
            </div>
        </div>

        {latestThought && (
            <div className="mb-6">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Latest Thought</label>
                <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-700/80 rounded-lg text-gray-700 dark:text-gray-300 text-sm italic">"{latestThought.text}"</p>
            </div>
        )}
        
        <div className="space-y-4">
            {canInstall && (
               <button
                onClick={installPrompt}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
               >
                 <Download size={18} />
                 Install App
               </button>
            )}
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <LogOut size={18} />
                Log Out
            </button>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-6">
            Wodo AI v1.7 (PWA Enabled)
        </p>
      </div>
    </div>
  );
};

export default SettingsModal;