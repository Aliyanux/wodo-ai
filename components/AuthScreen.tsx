import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { UserPlus } from 'lucide-react';

interface AuthScreenProps {
  onProfileCreate: (name: string, username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onProfileCreate }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      setError("Username can only contain lowercase letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    setTimeout(() => { // Simulate network latency
        onProfileCreate(name, username);
        // No need to handle success/failure here anymore
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <UserPlus className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Create Your Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Join the Wodo AI community to get started.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-2">Choose a Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name || !username}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-purple-400 flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;