import React from 'react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center space-x-1.5 p-2">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-typing-bubble"></div>
        </div>
    );
};

export default TypingIndicator;
