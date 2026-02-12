import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Chat, Message } from './ChatTypes';

interface ChatWindowProps {
  selectedChat: Chat;
  onBack: () => void;
  onBlock: () => void;
  onSendMessage: (message: Message) => void;
  formatTime: (dateString: string) => string;
  getInitials: (name: string) => string;
}

export const ChatWindow = ({
  selectedChat,
  onBack,
  onBlock,
  onSendMessage,
  formatTime,
  getInitials
}: ChatWindowProps) => {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = [
    '😊', '😂', '❤️', '👍', '👏', '🔥', '💯', '🎉',
    '😎', '🤔', '😅', '🙌', '👌', '✨', '⚡', '💪',
    '🎯', '🏆', '🎲', '♟️', '👑', '⭐', '💎', '🚀'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Вы',
      text: messageText,
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    onSendMessage(newMessage);
    setMessageText('');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
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
            <Button
              onClick={onBlock}
              variant="outline"
              size="sm"
              className="border-red-400/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Icon name="Ban" size={16} className="mr-1" />
              Заблокировать
            </Button>
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
};
