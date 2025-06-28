import React, { useState, useEffect } from 'react';
import { UserAccount, ChatRequest, User } from '../types';
import { Mail, Check, X, UserPlus, MessageSquare } from 'lucide-react';
import UserAvatar from './UserAvatar';

const REQUESTS_KEY = 'wodo-chatRequests';

interface RequestsViewProps {
    currentUser: UserAccount;
    onAcceptChatRequest: (user: User) => void;
    onAcceptFriendRequest: (request: ChatRequest) => void;
}

const RequestsView: React.FC<RequestsViewProps> = ({ currentUser, onAcceptChatRequest, onAcceptFriendRequest }) => {
    const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
    const [friendRequests, setFriendRequests] = useState<ChatRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'chat' | 'friend'>('chat');

    const fetchRequests = () => {
        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        if (storedRequests) {
            try {
                const allRequests: ChatRequest[] = JSON.parse(storedRequests);
                const userPendingRequests = allRequests.filter(
                    req => req.receiverId === currentUser.username && req.status === 'pending'
                ).sort((a,b) => b.timestamp - a.timestamp);

                setChatRequests(userPendingRequests.filter(r => r.type === 'chat' || !r.type));
                setFriendRequests(userPendingRequests.filter(r => r.type === 'friend'));
            } catch (e) {
                console.error("Failed to parse requests from localStorage", e);
                setChatRequests([]);
                setFriendRequests([]);
            }
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentUser.username]);

    const updateRequestStatus = (requestId: string, status: 'accepted' | 'declined') => {
        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        if (!storedRequests) return null;

        let allRequests: ChatRequest[] = [];
        try {
            allRequests = JSON.parse(storedRequests);
        } catch (e) {
            console.error("Failed to parse requests from localStorage", e);
            return null;
        }
        
        const requestIndex = allRequests.findIndex(r => r.id === requestId);

        if (requestIndex > -1) {
            allRequests[requestIndex].status = status;
            localStorage.setItem(REQUESTS_KEY, JSON.stringify(allRequests));
            fetchRequests(); // Re-fetch to update UI
            return allRequests[requestIndex];
        }
        return null;
    };

    const handleDecline = (requestId: string) => {
        updateRequestStatus(requestId, 'declined');
    };

    const handleAcceptChat = (request: ChatRequest) => {
        const updatedRequest = updateRequestStatus(request.id, 'accepted');
        if (updatedRequest) {
            const userToChat: User = {
                id: request.senderId,
                name: request.senderName,
                storySummary: request.message || 'Accepted your chat request.',
                storyDetail: request.message ? `They sent you a message: "${request.message}"` : 'This user accepted your request to chat.'
            };
            onAcceptChatRequest(userToChat);
        }
    };

    const handleAcceptFriend = (request: ChatRequest) => {
        const updatedRequest = updateRequestStatus(request.id, 'accepted');
        if (updatedRequest) {
            onAcceptFriendRequest(updatedRequest);
        }
    };

    const TabButton = ({ type, label, icon: Icon, count }: { type: 'chat' | 'friend', label: string, icon: React.ElementType, count: number }) => (
        <button onClick={() => setActiveTab(type)} className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-semibold transition-colors relative ${activeTab === type ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
            <Icon className="w-5 h-5" />
            {label}
            {count > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{count}</span>}
            {activeTab === type && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></div>}
        </button>
    );

    const RequestList = ({ requests, onAccept, type }: { requests: ChatRequest[], onAccept: (req: ChatRequest) => void, type: 'chat' | 'friend' }) => (
        <div className="space-y-3">
            {requests.map(req => (
                <div key={req.id} className="bg-gray-50/80 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <UserAvatar name={req.senderName} />
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    <span className="font-bold">{req.senderName}</span> sent you a {type} request.
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(req.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onAccept(req)} className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors" aria-label={`Accept request from ${req.senderName}`}>
                                <Check size={20} />
                            </button>
                            <button onClick={() => handleDecline(req.id)} className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors" aria-label={`Decline request from ${req.senderName}`}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    {req.message && type === 'chat' && (
                        <div className="mt-3 pl-14">
                            <p className="text-sm bg-gray-100 dark:bg-gray-600 p-3 rounded-lg italic">"{req.message}"</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col h-full">
                <header className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Your Requests</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Manage incoming connections.</p>
                </header>
                <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
                    <TabButton type="chat" label="Chat Requests" icon={MessageSquare} count={chatRequests.length} />
                    <TabButton type="friend" label="Friend Requests" icon={UserPlus} count={friendRequests.length} />
                </div>
                <main className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'chat' && (
                        chatRequests.length > 0 ? <RequestList requests={chatRequests} onAccept={handleAcceptChat} type="chat" /> : 
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
                            <Mail className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                            <p className="font-semibold text-lg">No new chat requests.</p>
                        </div>
                    )}
                     {activeTab === 'friend' && (
                        friendRequests.length > 0 ? <RequestList requests={friendRequests} onAccept={handleAcceptFriend} type="friend" /> : 
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
                            <UserPlus className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                            <p className="font-semibold text-lg">No new friend requests.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RequestsView;