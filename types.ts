export enum AppState {
  Auth,
  Huka,
  BirthdayGift,
  Dashboard,
}

// For the main, logged-in user
export interface UserAccount {
  name: string;
  username: string; // Unique identifier
}

// For AI-generated fictional profiles or actual people from feeds
export interface User {
  id: string; // Can be a username for actual people, or a random ID for AI
  name: string;
  storySummary: string;
  storyDetail: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// For the new "Today's Thought" feature
export interface TodaysThought {
  id: string;
  userId: string; // username of the user who posted it
  userName: string;
  text: string;
  timestamp: number;
}

// For the new chat request system
export type RequestStatus = 'pending' | 'accepted' | 'declined';
export type RequestType = 'chat' | 'friend';

export interface ChatRequest {
    id: string;
    senderId: string; // username
    senderName: string;
    receiverId: string; // username
    status: RequestStatus;
    timestamp: number;
    type: RequestType;
    message?: string;
}

// For the new Friends list
export interface Friend {
  id: string; // username for people, random for AI
  name: string;
  storySummary: string;
}

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
