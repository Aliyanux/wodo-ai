import React from 'react';
import { Feather } from 'lucide-react';
import { UserAccount } from '../types';

interface HukaScreenProps {
  user: UserAccount;
  onContinue: () => void;
}

const HukaScreen: React.FC<HukaScreenProps> = ({ user, onContinue }) => {

  return (
    <div className="flex items-center justify-center h-full p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
             <Feather className="w-8 h-8 text-purple-500" />
             <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">A Letter for You</h1>
          </div>
          
          <div className="text-gray-600 dark:text-gray-300 space-y-4 prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg">Welcome, <span className="font-semibold text-purple-600 dark:text-purple-400">{user.name}</span>,</p>
            
            <p>You've arrived at Wodo AI, a place for creation and connection. We call this welcome Huka—a breath of life for your journey here.</p>
            <p>Inside, you have multiple paths to explore:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Wodo AI Chat:</strong> Your personal AI companion. Ask it anything, brainstorm ideas, or simply have a conversation.</li>
              <li><strong>Find Connections:</strong> Share a story and connect with AI characters, or browse thoughts from <strong>actual people</strong> in the community feed.</li>
               <li><strong>Today's Thought:</strong> Share a thought for the day. Others can see it and send you a chat request to connect.</li>
            </ul>
            <p>This is your space to explore, create, and connect. Enjoy the journey.</p>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onContinue}
              className="font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-full px-8 py-3 transition-transform transform hover:scale-105"
            >
              Begin My Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HukaScreen;