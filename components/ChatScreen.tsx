import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, UserAccount, Friend, ChatRequest } from '../types';
import UserAvatar from './UserAvatar';
import { UserPlus, Check, Send } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import { marked } from 'marked';

const isActualPerson = (id: string) => !id.startsWith('u_');
const FRIENDS_KEY_PREFIX = 'wodo-friends-';
const REQUESTS_KEY = 'wodo-chatRequests';

interface ChatScreenProps {
  user: User;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser: UserAccount;
  friends: Friend[];
  sentFriendRequests: string[];
  onFriendAction: (isAiFriend: boolean) => void; // MODIFIED: More specific callback
  isSending: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user, messages, onSendMessage, currentUser, friends, sentFriendRequests, onFriendAction, isSending }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFriend = friends.some(f => f.id === user.id);
  const isRequestSent = sentFriendRequests.includes(user.id);
  const canAddFriend = !isFriend && !isRequestSent && user.id !== currentUser.username;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  useEffect(() => {
    setInputValue('');
  }, [user]);

  const handleSend = async () => {
    if (inputValue.trim() && !isSending) {
      const messageToSend = inputValue;
      setInputValue('');
      await onSendMessage(messageToSend);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const handleAddFriend = () => {
    if (!canAddFriend) return;

    const isAi = !isActualPerson(user.id);

    if(!isAi) {
        // Send a friend request
        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        const requests: ChatRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
        const newRequest: ChatRequest = {
            id: `freq_${new Date().getTime()}`,
            senderId: currentUser.username,
            senderName: currentUser.name,
            receiverId: user.id,
            status: 'pending',
            timestamp: new Date().getTime(),
            type: 'friend',
            message: `${currentUser.name} wants to be your friend.`
        };
        requests.push(newRequest);
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    } else {
        // Add AI friend directly
        const friendsKey = `${FRIENDS_KEY_PREFIX}${currentUser.username}`;
        const storedFriends = localStorage.getItem(friendsKey);
        const currentFriends: Friend[] = storedFriends ? JSON.parse(storedFriends) : [];
        const newFriend: Friend = { id: user.id, name: user.name, storySummary: user.storySummary };
        currentFriends.push(newFriend);
        localStorage.setItem(friendsKey, JSON.stringify(currentFriends));
    }

    onFriendAction(isAi); // MODIFIED: Notify parent to re-fetch state and pass friend type
  };

  const AddFriendButton = () => {
    if (!canAddFriend) return null;

    if (isActualPerson(user.id)) {
        return (
            <button onClick={handleAddFriend} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/50 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors">
                <Send size={14}/> Friend Request
            </button>
        )
    }

    return (
        <button onClick={handleAddFriend} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/50 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors">
            <UserPlus size={16}/> Add Friend
        </button>
    );
  }
  
  const createMarkup = (text: string) => {
    const rawMarkup = marked(text, { breaks: true, gfm: true });
    return { __html: rawMarkup };
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate max-w-xs">"{user.storySummary}"</p>
          </div>
        </div>
         <div className="pr-2">
            {isFriend ? (
                 <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2"><Check size={16}/> Friends</span>
            ) : isRequestSent ? (
                <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-default">Request Sent</span>
            ) : (
                <AddFriendButton />
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <UserAvatar name={user.name} size="sm" />}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
              {msg.sender === 'ai' ? 
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={createMarkup(msg.text)} /> : 
                <p className="text-sm">{msg.text}</p>
              }
              <p className="text-xs text-right mt-1 opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
            </div>
             {msg.sender === 'user' && <UserAvatar name={currentUser.name} size="sm" />}
          </div>
        ))}
        {isSending && (
             <div className="flex items-end gap-3 justify-start">
                <UserAvatar name={user.name} size="sm" />
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg">
                    <TypingIndicator />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Send a message to ${user.name}...`}
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full focus:ring-2 focus:ring-purple-500"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-full transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center w-11 h-11"
          >
            {isSending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;