import React, { useState, useEffect } from 'react';
import { UserAccount, TodaysThought, ChatRequest } from '../types';
import { Rss, Send } from 'lucide-react';
import RequestChatModal from './RequestChatModal';
import UserAvatar from './UserAvatar';

const THOUGHTS_KEY = 'wodo-todaysThoughts';
const REQUESTS_KEY = 'wodo-chatRequests';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const getThoughts = (): TodaysThought[] => {
    const stored = localStorage.getItem(THOUGHTS_KEY);
    if (!stored) return [];
    try {
        const allThoughts: TodaysThought[] = JSON.parse(stored);
        const now = new Date().getTime();
        return allThoughts.filter(t => (now - t.timestamp) < TWENTY_FOUR_HOURS_MS);
    } catch (e) {
        return [];
    }
};

const addThought = (thought: TodaysThought) => {
    const thoughts = getThoughts();
    const otherThoughts = thoughts.filter(t => t.userId !== thought.userId);
    const newThoughts = [...otherThoughts, thought];
    localStorage.setItem(THOUGHTS_KEY, JSON.stringify(newThoughts));
};

const TodaysThoughtView: React.FC<{ currentUser: UserAccount }> = ({ currentUser }) => {
    const [thoughts, setThoughts] = useState<TodaysThought[]>([]);
    const [myThought, setMyThought] = useState<string>('');
    const [hasPostedToday, setHasPostedToday] = useState(false);
    const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestTarget, setRequestTarget] = useState<TodaysThought | null>(null);

    useEffect(() => {
        const currentThoughts = getThoughts();
        setThoughts(currentThoughts);
        const userThought = currentThoughts.find(t => t.userId === currentUser.username);
        setHasPostedToday(!!userThought);

        // Check for existing requests sent by the current user
        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        if(storedRequests) {
            try {
                const allRequests: ChatRequest[] = JSON.parse(storedRequests);
                const userSentRequests = allRequests
                    .filter(req => req.senderId === currentUser.username)
                    .map(req => req.receiverId);
                setSentRequestIds(userSentRequests);
            } catch (e) {
                console.error("Failed to parse requests", e);
            }
        }
    }, [currentUser.username]);

    const handleSubmitThought = (e: React.FormEvent) => {
        e.preventDefault();
        if (myThought.trim().length === 0) return;

        const newThought: TodaysThought = {
            id: `thought_${new Date().getTime()}`,
            userId: currentUser.username,
            userName: currentUser.name,
            text: myThought,
            timestamp: new Date().getTime(),
        };
        
        addThought(newThought);
        setThoughts(getThoughts());
        setMyThought('');
        setHasPostedToday(true);
    };

    const handleOpenRequestModal = (thought: TodaysThought) => {
        setRequestTarget(thought);
        setIsModalOpen(true);
    };
    
    const handleSendRequest = (message: string) => {
        if (!requestTarget) return;

        const storedRequests = localStorage.getItem(REQUESTS_KEY);
        const requests: ChatRequest[] = storedRequests ? JSON.parse(storedRequests) : [];

        const newRequest: ChatRequest = {
            id: `req_${new Date().getTime()}`,
            senderId: currentUser.username,
            senderName: currentUser.name,
            receiverId: requestTarget.userId,
            status: 'pending',
            timestamp: new Date().getTime(),
            type: 'chat',
            message: message,
        };
        
        requests.push(newRequest);
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
        setSentRequestIds(prev => [...prev, requestTarget.userId]);
        setIsModalOpen(false);
        setRequestTarget(null);
    };

    return (
        <>
            <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Today's Thought</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Share a fleeting thought with the community. Posts are cleared every 24 hours.</p>
                    <form onSubmit={handleSubmitThought} className="mt-4 flex items-start gap-4">
                        <textarea
                            value={myThought}
                            onChange={(e) => setMyThought(e.target.value)}
                            placeholder={hasPostedToday ? "You've shared your thought for today." : "What's on your mind?"}
                            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-24"
                            disabled={hasPostedToday}
                            maxLength={280}
                        />
                        <button
                            type="submit"
                            disabled={!myThought.trim() || hasPostedToday}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send size={18} />
                            Share
                        </button>
                    </form>
                     {myThought.length > 0 && <p className="text-right text-xs text-gray-400 mt-1">{myThought.length} / 280</p>}
                </header>

                <main className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">Community Feed</h2>
                    <div className="space-y-4">
                        {thoughts.length > 0 ? (
                            thoughts
                                .sort((a, b) => b.timestamp - a.timestamp)
                                .map(thought => (
                                <div key={thought.id} className="p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg animate-fade-in">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar name={thought.userName} />
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{thought.userName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(thought.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        {thought.userId !== currentUser.username && (
                                            sentRequestIds.includes(thought.userId) ? (
                                                <button 
                                                    disabled
                                                    className="text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-default">
                                                    Request Sent
                                                </button>
                                            ) : (
                                                 <button 
                                                    onClick={() => handleOpenRequestModal(thought)}
                                                    className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                                                    Request Chat
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <p className="mt-3 text-gray-700 dark:text-gray-300">{thought.text}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                 <Rss className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                                <p className="font-semibold">The feed is quiet.</p>
                                <p>Be the first to share a thought today!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {requestTarget && (
                <RequestChatModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userName={requestTarget.userName}
                    onSendRequest={handleSendRequest}
                />
            )}
        </>
    );
};

export default TodaysThoughtView;