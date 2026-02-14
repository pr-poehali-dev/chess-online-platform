export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRating: number;
  participantCity?: string;
  participantStatus?: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageIsOwn?: boolean;
  unreadCount: number;
  messages: Message[];
}

export interface ChatSectionProps {
  initialChatId?: string;
  initialParticipantName?: string;
  initialParticipantRating?: number;
}

export const CHAT_URL = 'https://functions.poehali.dev/6cee8b5c-e400-4366-b747-7c9f1492f4c4';
