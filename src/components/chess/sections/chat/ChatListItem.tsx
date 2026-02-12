import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Chat } from './ChatTypes';

interface ChatListItemProps {
  chat: Chat;
  onSelect: (chat: Chat) => void;
  formatChatTime: (dateString: string) => string;
  getInitials: (name: string) => string;
}

export const ChatListItem = ({ chat, onSelect, formatChatTime, getInitials }: ChatListItemProps) => {
  return (
    <div
      onClick={() => onSelect(chat)}
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
  );
};
