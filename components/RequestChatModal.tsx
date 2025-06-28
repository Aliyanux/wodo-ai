import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface RequestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSendRequest: (message: string) => void;
}

const RequestChatModal: React.FC<RequestChatModalProps> = ({ isOpen, onClose, userName, onSendRequest }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSend = () => {
    if (message.trim()) {
      onSendRequest(message);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 p-8 relative animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Send a request to <span className="text-purple-500">{userName}</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Introduce yourself with a short message.</p>

        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${userName}, I saw your thought and...`}
            className="w-full h-32 p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
            maxLength={200}
            autoFocus
          />
          <p className="text-right text-xs text-gray-400 mt-1">{message.length} / 200</p>
        </div>

        <div className="mt-6 flex justify-end items-center gap-4">
           <button
            onClick={onClose}
            className="font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestChatModal;