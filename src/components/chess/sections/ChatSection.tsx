import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRating: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: Message[];
}

interface ChatSectionProps {
  initialChatId?: string;
  initialParticipantName?: string;
  initialParticipantRating?: number;
}

export const ChatSection = ({ 
  initialChatId, 
  initialParticipantName, 
  initialParticipantRating 
}: ChatSectionProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = [
    '😊', '😂', '❤️', '👍', '👏', '🔥', '💯', '🎉', 
    '😎', '🤔', '😅', '🙌', '👌', '✨', '⚡', '💪',
    '🎯', '🏆', '🎲', '♟️', '👑', '⭐', '💎', '🚀'
  ];

  useEffect(() => {
    const savedChats = localStorage.getItem('chessChats');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      
      if (initialChatId) {
        const chat = parsedChats.find((c: Chat) => c.id === initialChatId);
        if (chat) {
          setSelectedChat(chat);
        }
      }
    } else {
      const mockChats: Chat[] = [
        {
          id: '1',
          participantId: 'USER-A1B2C3D',
          participantName: 'Александр Петров',
          participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexanderP',
          participantRating: 1920,
          lastMessage: 'Отличная партия! Спасибо за игру',
          lastMessageTime: '2026-02-12T14:35:00',
          unreadCount: 0,
          messages: [
            {
              id: '1',
              senderId: 'USER-A1B2C3D',
              senderName: 'Александр Петров',
              text: 'Привет! Хорошая игра получилась',
              timestamp: '2026-02-12T14:32:00',
              isOwn: false
            },
            {
              id: '2',
              senderId: 'me',
              senderName: 'Вы',
              text: 'Спасибо! Ты отлично защищался',
              timestamp: '2026-02-12T14:33:00',
              isOwn: true
            },
            {
              id: '3',
              senderId: 'USER-A1B2C3D',
              senderName: 'Александр Петров',
              text: 'Отличная партия! Спасибо за игру',
              timestamp: '2026-02-12T14:35:00',
              isOwn: false
            }
          ]
        },
        {
          id: '2',
          participantId: 'USER-E4F5G6H',
          participantName: 'Мария Смирнова',
          participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaS',
          participantRating: 1875,
          lastMessage: 'Хочешь реванш?',
          lastMessageTime: '2026-02-11T18:20:00',
          unreadCount: 2,
          messages: [
            {
              id: '1',
              senderId: 'me',
              senderName: 'Вы',
              text: 'Хорошая игра была!',
              timestamp: '2026-02-11T18:17:00',
              isOwn: true
            },
            {
              id: '2',
              senderId: 'USER-E4F5G6H',
              senderName: 'Мария Смирнова',
              text: 'Да, спасибо! Твоя защита была сильной',
              timestamp: '2026-02-11T18:18:00',
              isOwn: false
            },
            {
              id: '3',
              senderId: 'USER-E4F5G6H',
              senderName: 'Мария Смирнова',
              text: 'Хочешь реванш?',
              timestamp: '2026-02-11T18:20:00',
              isOwn: false
            }
          ]
        },
        {
          id: '3',
          participantId: 'USER-I7J8K9L',
          participantName: 'Дмитрий Иванов',
          participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DmitryI',
          participantRating: 1835,
          lastMessage: 'Ничья - справедливый результат',
          lastMessageTime: '2026-02-10T20:50:00',
          unreadCount: 0,
          messages: [
            {
              id: '1',
              senderId: 'USER-I7J8K9L',
              senderName: 'Дмитрий Иванов',
              text: 'Напряженная партия!',
              timestamp: '2026-02-10T20:48:00',
              isOwn: false
            },
            {
              id: '2',
              senderId: 'me',
              senderName: 'Вы',
              text: 'Согласен, оба играли хорошо',
              timestamp: '2026-02-10T20:49:00',
              isOwn: true
            },
            {
              id: '3',
              senderId: 'USER-I7J8K9L',
              senderName: 'Дмитрий Иванов',
              text: 'Ничья - справедливый результат',
              timestamp: '2026-02-10T20:50:00',
              isOwn: false
            }
          ]
        }
      ];
      
      if (initialChatId && initialParticipantName && initialParticipantRating) {
        const existingChat = mockChats.find(c => c.id === initialChatId);
        if (!existingChat) {
          const newChat: Chat = {
            id: initialChatId,
            participantId: initialChatId,
            participantName: initialParticipantName,
            participantRating: initialParticipantRating,
            unreadCount: 0,
            messages: []
          };
          mockChats.unshift(newChat);
          setSelectedChat(newChat);
        } else {
          setSelectedChat(existingChat);
        }
      }
      
      setChats(mockChats);
      localStorage.setItem('chessChats', JSON.stringify(mockChats));
    }
  }, [initialChatId, initialParticipantName, initialParticipantRating]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return formatTime(dateString);
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const settings = localStorage.getItem('notificationSettings');
    const soundEnabled = settings ? JSON.parse(settings).messageSound : true;
    
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yk3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBAC');
      audio.play().catch(() => {});
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Вы',
      text: messageText,
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: messageText,
      lastMessageTime: new Date().toISOString()
    };

    const updatedChats = chats.map(chat => 
      chat.id === selectedChat.id ? updatedChat : chat
    );

    setChats(updatedChats);
    setSelectedChat(updatedChat);
    localStorage.setItem('chessChats', JSON.stringify(updatedChats));
    setMessageText('');
  };

  const handleChatSelect = (chat: Chat) => {
    const updatedChat = { ...chat, unreadCount: 0 };
    const updatedChats = chats.map(c => c.id === chat.id ? updatedChat : c);
    setChats(updatedChats);
    setSelectedChat(updatedChat);
    localStorage.setItem('chessChats', JSON.stringify(updatedChats));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(messageText + emoji);
    setShowEmojiPicker(false);
  };

  if (selectedChat) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setSelectedChat(null)}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-white/20"
                >
                  <Icon name="ChevronLeft" size={18} />
                </Button>
                <Avatar className="w-10 h-10">
                  {selectedChat.participantAvatar ? (
                    <AvatarImage src={selectedChat.participantAvatar} alt={selectedChat.participantName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      {getInitials(selectedChat.participantName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {selectedChat.participantName}
                  </CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Рейтинг: {selectedChat.participantRating}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                {selectedChat.messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    <Icon name="MessageCircle" className="mx-auto mb-4" size={48} />
                    <p>Начните разговор</p>
                  </div>
                ) : (
                  selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className="text-sm break-words">{message.text}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="space-y-2">
                {showEmojiPicker && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 shadow-lg animate-scale-in">
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    variant="outline"
                    className="border-slate-200 dark:border-white/20"
                  >
                    <Icon name="Smile" size={18} />
                  </Button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Написать сообщение..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Icon name="Send" size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="MessageCircle" className="text-blue-600 dark:text-blue-400" size={24} />
            Сообщения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chats.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="MessageCircle" className="mx-auto mb-4" size={48} />
                <p>Нет сообщений</p>
                <p className="text-sm">Начните диалог с соперниками или друзьями</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      {chat.participantAvatar ? (
                        <AvatarImage src={chat.participantAvatar} alt={chat.participantName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {getInitials(chat.participantName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {chat.participantName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {chat.lastMessage || 'Нет сообщений'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {chat.lastMessageTime && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {formatChatTime(chat.lastMessageTime)}
                      </div>
                    )}
                  </div>

                  <Icon name="ChevronRight" size={20} className="text-gray-400" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};