import React, { useState, useEffect } from 'react';
import { UserAccount, Friend, User } from '../types';
import { HeartHandshake, MessageSquare, Trash2, Users } from 'lucide-react';
import UserAvatar from './UserAvatar';

const FRIENDS_KEY_PREFIX = 'wodo-friends-';

interface FriendsViewProps {
    currentUser: UserAccount;
    onStartChat: (user: User) => void;
    activeView: 'chat' | 'connections' | 'thought' | 'requests' | 'friends';
    onNavigate: (view: 'chat' | 'connections' | 'thought' | 'requests' | 'friends') => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ currentUser, onStartChat, activeView, onNavigate }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const friendsKey = `${FRIENDS_KEY_PREFIX}${currentUser.username}`;

    const fetchFriends = () => {
        const storedFriends = localStorage.getItem(friendsKey);
        if (storedFriends) {
            try {
                setFriends(JSON.parse(storedFriends));
            } catch (e) {
                console.error("Failed to parse friends from localStorage", e);
                setFriends([]);
            }
        } else {
            setFriends([]);
        }
    };
    
    useEffect(() => {
        if (activeView === 'friends') {
            fetchFriends();
        }
    }, [currentUser.username, activeView]);

    const handleChat = (friend: Friend) => {
        const userToChat: User = {
            id: friend.id,
            name: friend.name,
            storySummary: friend.storySummary,
            storyDetail: `You are friends with ${friend.name}. Their story is: "${friend.storySummary}"`
        };
        onStartChat(userToChat);
    };

    const handleUnfriend = (friendId: string) => {
        const updatedFriends = friends.filter(friend => friend.id !== friendId);
        setFriends(updatedFriends);
        localStorage.setItem(friendsKey, JSON.stringify(updatedFriends));
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col h-full">
                <header className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Your Friends</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">People you've connected with.</p>
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                    {friends.length > 0 ? (
                        <div className="space-y-3">
                            {friends.map(friend => (
                                <div key={friend.id} className="bg-gray-50/80 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center gap-4">
                                        <UserAvatar name={friend.name} />
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">{friend.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate max-w-xs">"{friend.storySummary}"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleChat(friend)}
                                            className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/50 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors"
                                            aria-label={`Chat with ${friend.name}`}
                                        >
                                            <MessageSquare size={16} />
                                            Chat
                                        </button>
                                        <button
                                            onClick={() => handleUnfriend(friend.id)}
                                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                            aria-label={`Unfriend ${friend.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
                            <HeartHandshake className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                            <p className="font-semibold text-lg">Your friends list is empty.</p>
                            <p className="mt-1">Find new people in the Connections tab!</p>
                             <button onClick={() => onNavigate('connections')} 
                                className="mt-6 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-full px-6 py-3 transition-transform transform hover:scale-105 flex items-center gap-2">
                                <Users size={18}/>
                                Find Connections
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default FriendsView;