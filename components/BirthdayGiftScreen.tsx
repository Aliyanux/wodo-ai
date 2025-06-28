import React from 'react';
import { Gift, Sparkles, PartyPopper } from 'lucide-react';
import { UserAccount } from '../types';

interface BirthdayGiftScreenProps {
  user: UserAccount;
  onContinue: () => void;
}

const BirthdayGiftScreen: React.FC<BirthdayGiftScreenProps> = ({ user, onContinue }) => {
  return (
    <div className="flex items-center justify-center h-full p-4 animate-fade-in bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 dark:from-pink-900/50 dark:via-purple-900/50 dark:to-indigo-900/50">
      <div className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-in-up">
        <div className="p-8 md:p-12 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
             <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
             <Gift className="w-12 h-12 text-red-500" />
             <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
            Happy Birthday, {user.name}!
          </h1>
          
          <div className="text-gray-600 dark:text-gray-300 space-y-4 prose prose-lg dark:prose-invert max-w-none">
            <p>From all of us at Wodo AI, we wanted to wish you the happiest of birthdays!</p>
            <p>We're so excited you're here to celebrate with us. May your day be filled with joy, creativity, and wonderful connections.</p>
          </div>

          <div className="mt-10">
            <button
              onClick={onContinue}
              className="font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full px-8 py-4 transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto"
            >
              <PartyPopper />
              Let's Celebrate!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayGiftScreen;