import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Chat, ChatSectionProps, Message } from './chat/ChatTypes';
import { ChatListItem } from './chat/ChatListItem';
import { ChatWindow } from './chat/ChatWindow';

export const ChatSection = ({
  initialChatId,
  initialParticipantName,
  initialParticipantRating
}: ChatSectionProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

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

  const handleSendMessage = (newMessage: Message) => {
    if (!selectedChat) return;

    const settings = localStorage.getItem('notificationSettings');
    const soundEnabled = settings ? JSON.parse(settings).messageSound : true;

    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yk3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBAC');
      audio.play().catch(() => {});
    }

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: newMessage.text,
      lastMessageTime: new Date().toISOString()
    };

    const updatedChats = chats.map(chat =>
      chat.id === selectedChat.id ? updatedChat : chat
    );

    setChats(updatedChats);
    setSelectedChat(updatedChat);
    localStorage.setItem('chessChats', JSON.stringify(updatedChats));
  };

  const handleChatSelect = (chat: Chat) => {
    const updatedChat = { ...chat, unreadCount: 0 };
    const updatedChats = chats.map(c => c.id === chat.id ? updatedChat : c);
    setChats(updatedChats);
    setSelectedChat(updatedChat);
    localStorage.setItem('chessChats', JSON.stringify(updatedChats));
  };

  const handleBlockUser = () => {
    if (!selectedChat) return;

    if (confirm(`Вы действительно хотите заблокировать ${selectedChat.participantName}?`)) {
      const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
      blockedUsers.push(selectedChat.participantId);
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));

      const updatedChats = chats.filter(chat => chat.id !== selectedChat.id);
      setChats(updatedChats);
      localStorage.setItem('chessChats', JSON.stringify(updatedChats));

      setSelectedChat(null);
      alert(`Пользователь ${selectedChat.participantName} заблокирован`);
    }
  };

  if (selectedChat) {
    return (
      <ChatWindow
        selectedChat={selectedChat}
        onBack={() => setSelectedChat(null)}
        onBlock={handleBlockUser}
        onSendMessage={handleSendMessage}
        formatTime={formatTime}
        getInitials={getInitials}
      />
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
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  onSelect={handleChatSelect}
                  formatChatTime={formatChatTime}
                  getInitials={getInitials}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
