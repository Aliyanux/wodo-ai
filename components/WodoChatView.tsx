import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserAccount } from '../types';
import { getWodoReply } from '../services/geminiService';
import { MessageSquareHeart } from 'lucide-react';
import UserAvatar from './UserAvatar';
import TypingIndicator from './TypingIndicator';
import { marked } from 'marked';


interface WodoChatViewProps {
    currentUser: UserAccount;
}

const WodoChatView: React.FC<WodoChatViewProps> = ({ currentUser }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isSending]);

    const handleSendMessage = async (text: string) => {
        if (text.trim() && !isSending) {
            const newPlayerMessage: ChatMessage = { sender: 'user', text, timestamp: new Date().getTime() };
            const currentMessages = [...messages, newPlayerMessage];
            setMessages(currentMessages);
            setInputValue('');
            setIsSending(true);

            try {
                const replyText = await getWodoReply(currentMessages);
                const newAiMessage: ChatMessage = { sender: 'ai', text: replyText, timestamp: new Date().getTime() };
                setMessages(prev => [...prev, newAiMessage]);
            } catch (e) {
                console.error(e);
                const errorMessage: ChatMessage = {
                    sender: 'ai',
                    text: 'Sorry, I hit a snag. Could you try that again?',
                    timestamp: new Date().getTime()
                };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage(inputValue);
        }
    };

    const createMarkup = (text: string) => {
        const rawMarkup = marked(text, { breaks: true, gfm: true });
        return { __html: rawMarkup };
    };

    return (
        <div className="flex flex-col h-full p-4 md:p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col h-full">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full p-8">
                        <MessageSquareHeart className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" strokeWidth={1} />
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Wodo AI</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Your creative partner. Ask me anything!</p>
                    </div>
                ) : (
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && <UserAvatar name="Wodo" size="sm" />}
                                <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
                                    {msg.sender === 'ai' ? 
                                        <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={createMarkup(msg.text)} /> :
                                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    }
                                    <p className="text-xs text-right mt-1 opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                                </div>
                                {msg.sender === 'user' && <UserAvatar name={currentUser.name} size="sm" />}
                            </div>
                        ))}
                        {isSending && (
                            <div className="flex items-end gap-3 justify-start">
                                <UserAvatar name="Wodo" size="sm" />
                                <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-lg"><TypingIndicator/></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
                
                {/* Input */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Message Wodo AI..."
                            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full focus:ring-2 focus:ring-purple-500"
                            disabled={isSending}
                        />
                        <button
                            onClick={() => handleSendMessage(inputValue)}
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
        </div>
    );
};

export default WodoChatView;