import React, { useState, useEffect } from 'react';
import { User, ChatMessage, TodaysThought, UserAccount, ChatRequest, Friend } from '../types';
import { getChatReply, findMatchingUsers } from '../services/geminiService';
import ChatScreen from './ChatScreen';
import RequestChatModal from './RequestChatModal';
import { Users, FileText, Bot, User as UserIcon, Send } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import UserAvatar from './UserAvatar';


const REQUESTS_KEY = 'wodo-chatRequests';
const FRIENDS_KEY_PREFIX = 'wodo-friends-';
const THOUGHTS_KEY = 'wodo-todaysThoughts';

interface FindConnectionsViewProps {
    currentUser: UserAccount;
    directChatUser: User | null;
    onChatClosed: () => void;
    activeView: 'chat' | 'connections' | 'thought' | 'requests' | 'friends';
    onAiFriendAdded: () => void;
}

const FindConnectionsView: React.FC<FindConnectionsViewProps> = ({ currentUser, directChatUser, onChatClosed, activeView, onAiFriendAdded }) => {
    const [viewState, setViewState] = useState<'form' | 'loading' | 'results'>('form');
    const [storyInput, setStoryInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const [aiUsers, setAiUsers] = useState<User[]>([]);
    const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    
    const [connectionType, setConnectionType] = useState<'ai' | 'people'>('ai');
    const [realPeople, setRealPeople] = useState<User[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestTargetUser, setRequestTargetUser] = useState<User | null>(null);
    const [sentChatRequestIds, setSentChatRequestIds] = useState<string[]>([]);
    
    const [todaysUserThought, setTodaysUserThought] = useState<string | null>(null);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [sentFriendRequestIds, setSentFriendRequestIds] = useState<string[]>([]);
    
    const friendsKey = `${FRIENDS_KEY_PREFIX}${currentUser.username}`;

    const updateFriendAndRequestState = () => {
        // Load friends
        const storedFriends = localStorage.getItem(friendsKey);
        setFriends(storedFriends ? JSON.parse(storedFriends) : []);

        // Load sent requests (both types)
        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        if(storedRequests) {
            try {
                const allRequests: ChatRequest[] = JSON.parse(storedRequests);
                const userSentChatRequests = allRequests
                    .filter(req => req.senderId === currentUser.username && (req.type === 'chat' || !req.type))
                    .map(req => req.receiverId);
                const userSentFriendRequests = allRequests
                    .filter(req => req.senderId === currentUser.username && req.type === 'friend')
                    .map(req => req.receiverId);
                setSentChatRequestIds(userSentChatRequests);
                setSentFriendRequestIds(userSentFriendRequests);
            } catch (e) {
                console.error("Failed to parse requests", e);
            }
        }
    };
    
    const handleFriendAction = (isAiFriend: boolean) => {
        updateFriendAndRequestState();
        if (isAiFriend) {
            setTimeout(() => {
                onAiFriendAdded();
            }, 300); // Short delay for better UX
        }
    }

    // Effect to load all necessary states from localStorage when the view becomes active
    useEffect(() => {
        if (activeView !== 'connections') return;

        updateFriendAndRequestState();

        const storedThoughts = localStorage.getItem(THOUGHTS_KEY);
        if (storedThoughts) {
             try {
                const allThoughts: TodaysThought[] = JSON.parse(storedThoughts);
                
                // Populate today's thought button if it's recent
                const userThought = allThoughts.find(t => t.userId === currentUser.username);
                const now = new Date().getTime();
                if (userThought && (now - userThought.timestamp) < (24 * 60 * 60 * 1000)) {
                    setTodaysUserThought(userThought.text);
                } else {
                    setTodaysUserThought(null);
                }

                // Populate "Actual People" list from recent thoughts
                const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
                const recentThoughts = allThoughts.filter(t => t.timestamp > twentyFourHoursAgo && t.userId !== currentUser.username);
                const peopleFromThoughts: User[] = recentThoughts.map(t => ({
                    id: t.userId,
                    name: t.userName,
                    storySummary: t.text.substring(0, 80) + '...',
                    storyDetail: t.text,
                }));
                setRealPeople(peopleFromThoughts);
             } catch (e) {
                console.error("Failed to parse thoughts", e);
             }
        } else {
            setTodaysUserThought(null);
            setRealPeople([]);
        }
    }, [currentUser.username, activeView]);
    
    // Effect to handle direct navigation to a chat
    useEffect(() => {
        if (directChatUser) {
            setViewState('results');
            const isDirectUserActual = !directChatUser.id.startsWith('u_');
            setConnectionType(isDirectUserActual ? 'people' : 'ai');
            
            if (isDirectUserActual) {
                 setRealPeople(prev => {
                    const userExists = prev.some(p => p.id === directChatUser.id);
                    return userExists ? prev : [directChatUser, ...prev];
                });
            }
            
            handleStartChat(directChatUser);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directChatUser]);

    const handleFormSubmit = async (e: React.FormEvent, storyToUse: string) => {
        e.preventDefault();
        if (storyToUse.trim().length < 10) {
            setError("Please enter a story of at least 10 characters.");
            return;
        }
        setError(null);
        setViewState('loading');
        setAiUsers([]);
        onChatClosed();

        try {
            const users = await findMatchingUsers(storyToUse);
            setAiUsers(users);
            setViewState('results');
            setConnectionType('ai');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setViewState('form');
        }
    };

    const handleStartChat = (user: User) => {
        if (activeChatUser?.id !== user.id) {
            setActiveChatUser(user);
            setChatHistory([]);
        }
    };

    const handleOpenRequestModal = (user: User) => {
        setRequestTargetUser(user);
        setIsModalOpen(true);
    };

    const handleSendChatRequest = (message: string) => {
        if (!requestTargetUser) return;
    
        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        const requests: ChatRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    
        const newRequest: ChatRequest = {
            id: `req_${new Date().getTime()}`,
            senderId: currentUser.username,
            senderName: currentUser.name,
            receiverId: requestTargetUser.id,
            status: 'pending',
            timestamp: new Date().getTime(),
            message: message,
            type: 'chat',
        };
        
        requests.push(newRequest);
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
        setSentChatRequestIds(prev => [...prev, requestTargetUser.id]);
        setIsModalOpen(false);
        setRequestTargetUser(null);
    };

    const handleSendMessage = async (messageText: string) => {
        if (!activeChatUser) return;
        setIsSendingMessage(true);
        const newPlayerMessage: ChatMessage = { sender: 'user', text: messageText, timestamp: new Date().getTime() };
        const currentChatHistory = [...chatHistory, newPlayerMessage];
        setChatHistory(currentChatHistory);
        try {
          const replyText = await getChatReply(activeChatUser, currentChatHistory);
          const newAiMessage: ChatMessage = { sender: 'ai', text: replyText, timestamp: new Date().getTime() };
          setChatHistory(prev => [...prev, newAiMessage]);
        } catch (e) {
          console.error(e);
          const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I encountered an error.', timestamp: new Date().getTime() };
          setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleStartNewSearch = () => {
        setViewState('form');
        setStoryInput('');
        setActiveChatUser(null);
        onChatClosed();
    };

    const ConnectionTypeButton = ({ type, label, icon: Icon }: { type: 'ai' | 'people', label: string, icon: React.ElementType }) => (
        <button onClick={() => setConnectionType(type)} className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold transition-colors ${connectionType === type ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    if (viewState === 'form') {
        return (
            <div className="flex items-center justify-center h-full p-4">
                 <div className="w-full max-w-2xl text-center">
                    <FileText className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6 mx-auto" strokeWidth={1} />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Search with a Story</h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Share a story to find AI companions, or browse thoughts from actual people.</p>
    
                    {error && <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm"><strong>Error:</strong> {error}</div>}
    
                    <form onSubmit={(e) => handleFormSubmit(e, storyInput)} className="mt-8 w-full space-y-4">
                         <textarea value={storyInput} onChange={(e) => setStoryInput(e.target.value)} placeholder="For example: 'I taught myself to play the guitar and wrote a song about the stars...'" className="w-full h-40 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none" aria-label="Your story" />
                         <p className="text-xs text-gray-400 dark:text-gray-500 text-left">Minimum 10 characters required.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button type="submit" disabled={!storyInput.trim() || storyInput.trim().length < 10} className="w-full sm:w-auto flex items-center justify-center text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-full px-8 py-4 transition-transform transform hover:scale-105">
                                Find AI Companions
                            </button>
                            {todaysUserThought && (
                                <button type="button" onClick={(e) => handleFormSubmit(e, todaysUserThought)} className="w-full sm:w-auto text-lg font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-900 rounded-full px-8 py-4 transition-colors">
                                    Go with Today's Story
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <>
        <div className="flex h-full p-4 md:p-6 gap-6">
             <aside className="w-full md:w-1/3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl flex-col h-full hidden md:flex">
                <h3 className="p-4 text-xl font-bold text-center text-gray-800 dark:text-gray-200 border-b border-gray-200/50 dark:border-gray-700/50">
                    Your Connections
                </h3>
                <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
                    <ConnectionTypeButton type="ai" label="AI Companions" icon={Bot} />
                    <ConnectionTypeButton type="people" label="Actual People" icon={UserIcon} />
                </div>
                <div className="flex-grow overflow-y-auto p-2">
                    {viewState === 'loading' && connectionType === 'ai' && <SkeletonLoader count={4} />}
                    {viewState === 'results' && connectionType === 'ai' && (
                         <div className="space-y-2">
                            {aiUsers.map(user => (
                                <button key={user.id} onClick={() => handleStartChat(user)} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${user.id === activeChatUser?.id ? 'bg-purple-100 dark:bg-purple-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                                    <UserAvatar name={user.name} />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate italic">"{user.storySummary}"</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {connectionType === 'people' && (
                        realPeople.length > 0 ? (
                            <div className="space-y-2">
                                {realPeople.map(user => (
                                    <div key={user.id} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${user.id === activeChatUser?.id ? 'bg-purple-100 dark:bg-purple-900/50' : ''}`}>
                                        <button onClick={() => handleStartChat(user)} className="flex-grow flex items-center space-x-3 text-left">
                                            <UserAvatar name={user.name} />
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate italic">"{user.storySummary}"</p>
                                            </div>
                                        </button>
                                        {sentChatRequestIds.includes(user.id) || user.id === currentUser.username ? (
                                            <button disabled className="text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-default px-3 py-1">Request Sent</button>
                                        ) : (
                                            <button onClick={() => handleOpenRequestModal(user)} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline px-3 py-1 flex items-center gap-1">
                                                <Send size={14}/> Chat
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                                <p className="font-semibold">No one here yet!</p>
                                <p className="text-sm mt-1">Check out the Today's Thought section!</p>
                            </div>
                        )
                    )}
                </div>
                 <div className="p-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button onClick={handleStartNewSearch} className="w-full text-center p-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
                        Start New Search
                    </button>
                </div>
            </aside>
            <main className="w-full md:w-2/3 h-full">
                {activeChatUser ? (
                    <ChatScreen 
                        user={activeChatUser} 
                        messages={chatHistory} 
                        onSendMessage={handleSendMessage}
                        currentUser={currentUser}
                        friends={friends}
                        sentFriendRequests={sentFriendRequestIds}
                        onFriendAction={handleFriendAction}
                        isSending={isSendingMessage}
                    />
                ) : (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl flex-col h-full items-center justify-center text-center p-8 hidden md:flex">
                        <Users className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" strokeWidth={1} />
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Select a Connection</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">Choose someone from the list on the left to start a conversation.</p>
                    </div>
                )}
            </main>
        </div>
        {requestTargetUser && (
            <RequestChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userName={requestTargetUser.name}
                onSendRequest={handleSendChatRequest}
            />
        )}
        </>
    );
};

export default FindConnectionsView;