import React, { useState, useEffect } from 'react';
import { AppState, UserAccount, TodaysThought, ChatRequest } from './types';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import HukaScreen from './components/HukaScreen';
import BirthdayGiftScreen from './components/BirthdayGiftScreen';

const USERS_KEY = 'wodo-users';
const THOUGHTS_KEY = 'wodo-todaysThoughts';
const SESSION_KEY = 'wodo-session';

const seedInitialThoughts = () => {
  const existingThoughts = localStorage.getItem(THOUGHTS_KEY);
  if (!existingThoughts) {
    const initialThoughts: TodaysThought[] = [
      {
        id: 'thought_1',
        userId: 'alex_runs',
        userName: 'Alex',
        text: 'Just finished a marathon I never thought I could. Feeling on top of the world and wondering what the next big challenge should be!',
        timestamp: new Date().getTime(),
      },
      {
        id: 'thought_2',
        userId: 'cassie_creates',
        userName: 'Cassie',
        text: 'I started learning pottery, and the feeling of creating something from a lump of clay is incredibly grounding. It\'s messy but so meditative.',
        timestamp: new Date().getTime() - 3600 * 1000 * 3, // 3 hours ago
      },
    ];
    localStorage.setItem(THOUGHTS_KEY, JSON.stringify(initialThoughts));
  }
};

const seedWelcomeRequest = (currentUser: UserAccount) => {
    const requestsKey = 'wodo-chatRequests';
    
    const storedRequests = localStorage.getItem(requestsKey);
    const requests: ChatRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    
    // Check if a welcome request has already been sent to this user
    const hasBeenWelcomed = requests.some(r => r.receiverId === currentUser.username && r.senderId === 'cassie_creates');
    if (hasBeenWelcomed) return;

    const welcomeRequest: ChatRequest = {
        id: `req_${new Date().getTime()}`,
        senderId: 'cassie_creates',
        senderName: 'Cassie',
        receiverId: currentUser.username,
        status: 'pending',
        timestamp: new Date().getTime(),
        type: 'chat',
        message: "Hey! I saw you just joined. I'm learning pottery right now, it's so relaxing. Welcome to Wodo AI! What's something new you're exploring?"
    };

    requests.push(welcomeRequest);
    localStorage.setItem(requestsKey, JSON.stringify(requests));
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.Auth);

  useEffect(() => {
    seedInitialThoughts();
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const loggedInUser = JSON.parse(session);
        setCurrentUser(loggedInUser);
        setAppState(AppState.Dashboard);
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem(SESSION_KEY);
        setAppState(AppState.Auth);
      }
    }
  }, []);


  const handleProfileCreate = (name: string, username: string): void => {
    const users: UserAccount[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    const newUser: UserAccount = { name, username: username.toLowerCase() };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    setCurrentUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));

    // More robust check for Eman's birthday
    if (newUser.name.toLowerCase() === 'eman' || newUser.username === 'eman') {
        setAppState(AppState.BirthdayGift);
    } else {
        setAppState(AppState.Huka);
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setAppState(AppState.Auth);
  };

  const handleAcknowledgeWelcome = () => {
    if(!currentUser) return;
    seedWelcomeRequest(currentUser);
    setAppState(AppState.Dashboard);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.Auth:
        return <AuthScreen onProfileCreate={handleProfileCreate} />;
      case AppState.Huka:
        return <HukaScreen user={currentUser!} onContinue={handleAcknowledgeWelcome} />;
      case AppState.BirthdayGift:
        return <BirthdayGiftScreen user={currentUser!} onContinue={handleAcknowledgeWelcome} />;
      case AppState.Dashboard:
        return <Dashboard currentUser={currentUser!} onLogout={handleLogout} />;
      default:
        return <AuthScreen onProfileCreate={handleProfileCreate} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
        {renderContent()}
    </div>
  );
};

export default App;