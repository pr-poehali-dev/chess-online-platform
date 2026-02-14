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
    let chatList: Chat[] = savedChats ? JSON.parse(savedChats) : [];

    if (initialChatId && initialParticipantName) {
      const existing = chatList.find((c: Chat) => c.id === initialChatId || c.participantId === initialChatId);
      if (existing) {
        setSelectedChat(existing);
      } else {
        const newChat: Chat = {
          id: initialChatId,
          participantId: initialChatId,
          participantName: initialParticipantName,
          participantRating: initialParticipantRating || 1200,
          unreadCount: 0,
          messages: []
        };
        chatList = [newChat, ...chatList];
        setSelectedChat(newChat);
      }
    }

    setChats(chatList);
    localStorage.setItem('chessChats', JSON.stringify(chatList));
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