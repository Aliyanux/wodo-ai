import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'md' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const gradients = [
    'from-pink-500 to-orange-400',
    'from-purple-500 to-pink-500',
    'from-green-400 to-blue-500',
    'from-yellow-400 to-red-500',
    'from-teal-400 to-cyan-500',
    'from-indigo-500 to-purple-600',
    'from-red-500 to-yellow-500',
  ];

  const hash = hashString(name);
  const gradient = gradients[hash % gradients.length];
  
  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
  };

  return (
    <div 
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradient} ${sizeClasses[size]}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
