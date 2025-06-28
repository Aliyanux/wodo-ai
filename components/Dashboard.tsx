import React, { useState, useEffect } from 'react';
import { MessageSquareHeart, Users, Rss, Bell, HeartHandshake } from 'lucide-react';
import WodoChatView from './WodoChatView';
import FindConnectionsView from './FindConnectionsView';
import TodaysThoughtView from './TodaysThoughtView';
import RequestsView from './RequestsView';
import FriendsView from './FriendsView';
import { UserAccount, User, ChatRequest, Friend, TodaysThought } from '../types';
import Header from './Header';
import SettingsModal from './SettingsModal';
import { useInstall } from '../contexts/InstallContext';

type View = 'chat' | 'connections' | 'thought' | 'requests' | 'friends';
const FRIENDS_KEY_PREFIX = 'wodo-friends-';
const REQUESTS_KEY = 'wodo-chatRequests';
const THOUGHTS_KEY = 'wodo-todaysThoughts';

interface DashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('chat');
  const [directChatUser, setDirectChatUser] = useState<User | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [friendCount, setFriendCount] = useState(0);
  const [latestThought, setLatestThought] = useState<TodaysThought | null>(null);

  // Main data fetching/polling effect
  useEffect(() => {
    const fetchAllData = () => {
      // Fetch Requests
      const storedRequests = localStorage.getItem(REQUESTS_KEY);
      if (storedRequests) {
        try {
            const allRequests: ChatRequest[] = JSON.parse(storedRequests);
            const userRequests = allRequests.filter(
              req => req.receiverId === currentUser.username && req.status === 'pending'
            );
            setPendingRequestsCount(userRequests.length);
        } catch (e) { setPendingRequestsCount(0); }
      } else {
        setPendingRequestsCount(0);
      }

      // Fetch Friends
       const friendsKey = `${FRIENDS_KEY_PREFIX}${currentUser.username}`;
       const storedFriends = localStorage.getItem(friendsKey);
       if(storedFriends) {
           try {
               const friends: Friend[] = JSON.parse(storedFriends);
               setFriendCount(friends.length);
           } catch(e) { setFriendCount(0); }
       } else {
           setFriendCount(0);
       }

       // Fetch Latest Thought
       const storedThoughts = localStorage.getItem(THOUGHTS_KEY);
       if(storedThoughts) {
           try {
              const allThoughts: TodaysThought[] = JSON.parse(storedThoughts);
              const userThought = allThoughts.find(t => t.userId === currentUser.username);
              const now = new Date().getTime();
              if (userThought && (now - userThought.timestamp) < (24 * 60 * 60 * 1000)) {
                   setLatestThought(userThought);
              } else {
                   setLatestThought(null);
              }
           } catch(e) { setLatestThought(null); }
       } else {
            setLatestThought(null);
       }

    };
    
    fetchAllData();
    const interval = setInterval(fetchAllData, 2000); // Poll for updates every 2 seconds
    return () => clearInterval(interval);
  }, [currentUser.username]);
  
  const navItems = [
    { id: 'chat', label: 'Wodo AI Chat', icon: MessageSquareHeart },
    { id: 'connections', label: 'Find Connections', icon: Users },
    { id: 'thought', label: "Today's Thought", icon: Rss },
    { id: 'requests', label: 'Requests', icon: Bell, count: pendingRequestsCount },
    { id: 'friends', label: 'Friends', icon: HeartHandshake },
  ];
  
  const handleStartChat = (userToChat: User) => {
    setDirectChatUser(userToChat);
    setActiveView('connections');
  };
  
  const handleAcceptFriendRequest = (request: ChatRequest) => {
    const friendsKey = `${FRIENDS_KEY_PREFIX}${currentUser.username}`;
    const storedFriends = localStorage.getItem(friendsKey);
    const friends: Friend[] = storedFriends ? JSON.parse(storedFriends) : [];
    
    if (!friends.some(f => f.id === request.senderId)) {
        const newFriend: Friend = {
            id: request.senderId,
            name: request.senderName,
            storySummary: "You are now friends!"
        };
        friends.push(newFriend);
        localStorage.setItem(friendsKey, JSON.stringify(friends));
    }
  };

  const handleAiFriendAdded = () => {
    setActiveView('friends');
  };

  const ViewContainer: React.FC<{ viewId: View, children: React.ReactNode }> = ({ viewId, children }) => (
    <div className={`h-full w-full absolute inset-0 transition-opacity duration-300 ${activeView === viewId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {children}
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
       <Header currentUser={currentUser} onOpenSettings={() => setIsSettingsOpen(true)} />
       <div className="flex-grow flex overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-4 border-r border-gray-200/50 dark:border-gray-700/50 flex-col hidden sm:flex">
            <div className="mb-8 px-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Wodo AI</h2>
            </div>
            <ul className="space-y-2">
            {navItems.map(item => (
                <li key={item.id}>
                <button
                    onClick={() => {
                    setActiveView(item.id as View);
                    if (item.id !== 'connections') {
                        setDirectChatUser(null);
                    }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeView === item.id
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </div>
                    {item.count > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {item.count}
                        </span>
                    )}
                </button>
                </li>
            ))}
            </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 bg-transparent relative">
            <ViewContainer viewId="chat"><WodoChatView currentUser={currentUser} /></ViewContainer>
            <ViewContainer viewId="connections"><FindConnectionsView currentUser={currentUser} directChatUser={directChatUser} onChatClosed={() => setDirectChatUser(null)} activeView={activeView} onAiFriendAdded={handleAiFriendAdded} /></ViewContainer>
            <ViewContainer viewId="thought"><TodaysThoughtView currentUser={currentUser} /></ViewContainer>
            <ViewContainer viewId="requests"><RequestsView currentUser={currentUser} onAcceptChatRequest={handleStartChat} onAcceptFriendRequest={handleAcceptFriendRequest} /></ViewContainer>
            <ViewContainer viewId="friends"><FriendsView currentUser={currentUser} onStartChat={handleStartChat} activeView={activeView} onNavigate={setActiveView} /></ViewContainer>
        </main>
      </div>

       {/* Mobile Bottom Navigation */}
        <nav className="sm:hidden w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 flex justify-around">
            {navItems.map(item => (
                <button
                key={`mobile-${item.id}`}
                onClick={() => {
                    setActiveView(item.id as View);
                     if (item.id !== 'connections') {
                        setDirectChatUser(null);
                    }
                }}
                className={`flex-1 flex flex-col items-center p-2 transition-colors relative ${
                    activeView === item.id
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
                 {item.count > 0 && (
                    <span className="absolute top-1 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {item.count}
                    </span>
                )}
                </button>
            ))}
        </nav>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        onLogout={onLogout}
        friendCount={friendCount}
        latestThought={latestThought}
      />
    </div>
  );
};

export default Dashboard;