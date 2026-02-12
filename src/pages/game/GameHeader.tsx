import Icon from '@/components/ui/icon';

interface GameHeaderProps {
  showSettingsMenu: boolean;
  setShowSettingsMenu: (value: boolean) => void;
  setShowChat: (value: boolean) => void;
  handleExitClick: () => void;
  handleOfferDraw: () => void;
  handleSurrender: () => void;
  handleNewGame: () => void;
  setShowNotifications: (value: boolean) => void;
  showPossibleMoves?: boolean;
  setShowPossibleMoves?: (value: boolean) => void;
}

export const GameHeader = ({
  showSettingsMenu,
  setShowSettingsMenu,
  setShowChat,
  handleExitClick,
  handleOfferDraw,
  handleSurrender,
  handleNewGame,
  setShowNotifications
}: GameHeaderProps) => {
  return (
    <header className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50 px-4 py-3 flex items-center justify-center">
      <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-wide" style={{
        fontFamily: 'Montserrat, sans-serif',
        textShadow: '0 2px 10px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2)',
        letterSpacing: '0.05em'
      }}>
        ЛигаШахмат
      </h1>
    </header>
  );
};

export const GameControls = ({
  showSettingsMenu,
  setShowSettingsMenu,
  setShowChat,
  handleExitClick,
  handleOfferDraw,
  handleSurrender,
  handleNewGame,
  setShowNotifications,
  showPossibleMoves,
  setShowPossibleMoves
}: GameHeaderProps) => {
  return (
    <div className="flex gap-3">
        <button
          onClick={handleExitClick}
          className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Выход из игры"
        >
          <div className="rotate-180">
            <Icon name="LogOut" size={24} />
          </div>
        </button>
        <button
          onClick={() => setShowChat(true)}
          className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Чат"
        >
          <Icon name="MessageCircle" size={24} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Опции"
          >
            <Icon name="Settings" size={24} />
          </button>
          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSettingsMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-stone-800 rounded-lg shadow-xl border border-stone-700/50 overflow-hidden z-50 animate-scale-in">
                <button
                  onClick={() => {
                    if (setShowPossibleMoves) {
                      setShowPossibleMoves(!showPossibleMoves);
                    }
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center justify-between text-stone-300 hover:text-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Eye" size={20} />
                    <span>Показывать ходы</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors ${showPossibleMoves ? 'bg-green-600' : 'bg-stone-600'} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showPossibleMoves ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </button>
                <button
                  onClick={handleOfferDraw}
                  className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100 border-t border-stone-700/50"
                >
                  <Icon name="Handshake" size={20} />
                  <span>Предложить ничью</span>
                </button>
                <button
                  onClick={handleSurrender}
                  className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100"
                >
                  <Icon name="Flag" size={20} />
                  <span>Сдаться</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowNotifications(true);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100 border-t border-stone-700/50"
                >
                  <Icon name="Bell" size={20} />
                  <span>Уведомления</span>
                </button>
                <button
                  onClick={handleNewGame}
                  className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100 border-t border-stone-700/50"
                >
                  <Icon name="Plus" size={20} />
                  <span>Новая партия</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
  );
};