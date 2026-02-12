import { useRef } from 'react';
import Icon from '@/components/ui/icon';

interface ChatMessage {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
}

interface GameChatModalProps {
  opponentName: string;
  opponentIcon: string;
  opponentInfo?: string;
  chatMessages: ChatMessage[];
  chatMessage: string;
  onChatMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onChatKeyPress: (e: React.KeyboardEvent) => void;
  onBlock: () => void;
  onClose: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export const GameChatModal = ({
  opponentName,
  opponentIcon,
  opponentInfo,
  chatMessages,
  chatMessage,
  onChatMessageChange,
  onSendMessage,
  onChatKeyPress,
  onBlock,
  onClose,
  chatEndRef
}: GameChatModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-xl border border-stone-700 w-full max-w-2xl h-[80vh] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{opponentIcon}</div>
            <div>
              <h2 className="text-xl font-bold text-stone-100">
                {opponentName}
              </h2>
              {opponentInfo && (
                <div className="text-sm text-stone-400">{opponentInfo}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBlock}
              className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400 hover:text-red-300 border border-red-500/30"
              title="Заблокировать соперника"
            >
              <Icon name="Ban" size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-800 rounded-lg transition-colors text-stone-300 hover:text-stone-100"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Чат с соперником</p>
              <p className="text-sm mt-2">Игра продолжается в фоновом режиме</p>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isOwn
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-800 text-stone-100 border border-stone-700'
                    }`}
                  >
                    <div className="text-sm break-words">{message.text}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.isOwn ? 'text-amber-100' : 'text-stone-500'
                      }`}
                    >
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-stone-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => onChatMessageChange(e.target.value)}
              onKeyPress={onChatKeyPress}
              placeholder="Написать сообщение..."
              className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button 
              onClick={onSendMessage}
              disabled={!chatMessage.trim()}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Icon name="Send" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
