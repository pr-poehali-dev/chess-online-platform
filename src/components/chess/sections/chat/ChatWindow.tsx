import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Chat, Message } from './ChatTypes';

const TIME_OPTIONS = [
  { label: '1 мин', value: '1+0', cat: 'Пуля' },
  { label: '3 мин', value: '3+0', cat: 'Блиц' },
  { label: '3+2', value: '3+2', cat: 'Блиц' },
  { label: '5 мин', value: '5+0', cat: 'Блиц' },
  { label: '5+5', value: '5+5', cat: 'Блиц' },
  { label: '10 мин', value: '10+0', cat: 'Рапид' },
  { label: '15+10', value: '15+10', cat: 'Рапид' },
  { label: '30 мин', value: '30+0', cat: 'Рапид' },
];

const getTimeLabel = (time: string) => {
  const found = TIME_OPTIONS.find(t => t.value === time);
  if (found) return found.label;
  if (time.includes('+')) {
    const [m, i] = time.split('+');
    return i === '0' ? `${m} мин` : `${m}+${i}`;
  }
  return time;
};

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
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGameSetup, setShowGameSetup] = useState(false);
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

  const getLastGameSettings = () => {
    const saved = localStorage.getItem('lastGameSettings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { time: '10+0', color: 'random' };
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

  const sendGameInvite = (timeControl: string) => {
    localStorage.setItem('lastGameSettings', JSON.stringify({ time: timeControl, color: 'random' }));
    const inviteMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Вы',
      text: `♟️ Приглашение на партию: ${getTimeLabel(timeControl)}`,
      timestamp: new Date().toISOString(),
      isOwn: true
    };
    onSendMessage(inviteMsg);
    setShowGameSetup(false);
    navigate(`/online-game?opponent=country&time=${encodeURIComponent(timeControl)}&color=random`);
  };

  const handleQuickInvite = () => {
    const settings = getLastGameSettings();
    sendGameInvite(settings.time);
  };

  const lastSettings = getLastGameSettings();

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={onBack} variant="outline" size="sm" className="border-slate-200 dark:border-white/20">
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
            <Button onClick={onBlock} variant="outline" size="sm" className="border-red-400/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Icon name="Ban" size={16} className="mr-1" /> Заблокировать
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
                  <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.isOwn ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-slate-200 dark:border-white/10'
                    }`}>
                      <div className="text-sm break-words">{message.text}</div>
                      <div className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Game invite buttons */}
            <div className="flex gap-2 mb-3">
              <Button
                onClick={handleQuickInvite}
                className="bg-green-600 hover:bg-green-700 text-white border-0 flex-1 text-sm"
              >
                <Icon name="Swords" size={16} className="mr-1.5" />
                Играть {getTimeLabel(lastSettings.time)}
              </Button>
              <Button
                onClick={() => setShowGameSetup(!showGameSetup)}
                variant="outline"
                className="border-blue-300 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 flex-1 text-sm"
              >
                <Icon name="Settings" size={16} className="mr-1.5" />
                Выбрать режим
              </Button>
            </div>

            {showGameSetup && (
              <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 animate-scale-in">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Выберите контроль времени:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => sendGameInvite(opt.value)}
                      className="px-2 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors text-center"
                    >
                      <div>{opt.label}</div>
                      <div className="text-[9px] text-gray-400">{opt.cat}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {showEmojiPicker && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 shadow-lg animate-scale-in">
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji, index) => (
                      <button key={index} onClick={() => handleEmojiSelect(emoji)} className="text-2xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-1 transition-colors">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} variant="outline" className="border-slate-200 dark:border-white/20">
                  <Icon name="Smile" size={18} />
                </Button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Написать сообщение..."
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
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
