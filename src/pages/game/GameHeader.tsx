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
  theme?: 'light' | 'dark';
  setTheme?: (value: 'light' | 'dark') => void;
  gameStatus?: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  currentPlayer?: 'white' | 'black';
  setShowRematchOffer?: (value: boolean) => void;
}

export const GameHeader = ({
  showSettingsMenu,
  setShowSettingsMenu,
  setShowChat,
  handleExitClick,
  handleOfferDraw,
  handleSurrender,
  handleNewGame,
  setShowNotifications,
  theme
}: GameHeaderProps) => {
  return (
    <header className={`backdrop-blur-sm border-b px-4 py-3 flex items-center justify-center ${
      theme === 'light'
        ? 'bg-white/80 border-slate-300'
        : 'bg-stone-900/80 border-stone-700/50'
    }`}>
      <h1 className={`text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r tracking-wide ${
        theme === 'light'
          ? 'from-amber-600 via-yellow-500 to-amber-600'
          : 'from-amber-200 via-yellow-400 to-amber-200'
      }`} style={{
        fontFamily: 'Montserrat, sans-serif',
        textShadow: theme === 'light' 
          ? '0 2px 10px rgba(217, 119, 6, 0.2), 0 0 30px rgba(217, 119, 6, 0.1)'
          : '0 2px 10px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2)',
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
  setShowPossibleMoves,
  theme,
  setTheme,
  gameStatus,
  currentPlayer,
  setShowRematchOffer
}: GameHeaderProps) => {
  return (
    <div className="w-full md:w-auto h-[52px] md:h-[56px]">
      <div className="flex items-center gap-1.5 md:gap-2 h-full">
        <button
          onClick={handleExitClick}
          className={`p-3 md:p-2.5 border rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ${
            theme === 'light'
              ? 'bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
              : 'bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100'
          }`}
          title="Выход из игры"
        >
          <div className="rotate-180">
            <Icon name="LogOut" size={20} />
          </div>
        </button>
        <button
          onClick={() => setShowChat(true)}
          className={`p-3 md:p-2.5 border rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ${
            theme === 'light'
              ? 'bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
              : 'bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100'
          }`}
          title="Чат"
        >
          <Icon name="MessageCircle" size={20} />
        </button>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={`p-4 md:p-3 border rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center ${
              theme === 'light'
                ? 'bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100'
            }`}
            title="Опции"
          >
            <Icon name="Settings" size={20} />
          </button>
          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSettingsMenu(false)}
              />
              <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl border overflow-hidden z-50 animate-scale-in ${
                theme === 'light'
                  ? 'bg-white border-slate-300'
                  : 'bg-stone-800 border-stone-700/50'
              }`}>
                <button
                  onClick={() => {
                    if (setTheme) {
                      const newTheme = theme === 'dark' ? 'light' : 'dark';
                      setTheme(newTheme);
                      localStorage.setItem('chessTheme', newTheme);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={theme === 'dark' ? 'Moon' : 'Sun'} size={20} />
                    <span>{theme === 'dark' ? 'Темная тема' : 'Светлая тема'}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors ${theme === 'light' ? 'bg-amber-500' : 'bg-stone-600'} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'light' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (setShowPossibleMoves) {
                      setShowPossibleMoves(!showPossibleMoves);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-t ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50'
                  }`}
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
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50'
                  }`}
                >
                  <Icon name="Handshake" size={20} />
                  <span>Предложить ничью</span>
                </button>
                <button
                  onClick={handleSurrender}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50'
                  }`}
                >
                  <Icon name="Flag" size={20} />
                  <span>Сдаться</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowNotifications(true);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50'
                  }`}
                >
                  <Icon name="Bell" size={20} />
                  <span>Уведомления</span>
                </button>
                <button
                  onClick={handleNewGame}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50'
                  }`}
                >
                  <Icon name="Plus" size={20} />
                  <span>Новая партия</span>
                </button>
              </div>
            </>
          )}
        </div>
        {gameStatus !== 'playing' && (
          <div className={`backdrop-blur-sm rounded-lg p-2 md:p-3 border flex items-center justify-between flex-1 min-w-0 ml-1 md:ml-2 ${
            theme === 'light'
              ? 'bg-blue-500/90 border-blue-600'
              : 'bg-blue-600/90 border-blue-700'
          }`}>
            <div className="text-xs md:text-sm font-bold text-white truncate">
              {gameStatus === 'checkmate' && currentPlayer === 'white' && 'Вы проиграли'}
              {gameStatus === 'checkmate' && currentPlayer === 'black' && 'Вы выиграли'}
              {gameStatus === 'stalemate' && 'Пат'}
              {gameStatus === 'draw' && 'Ничья'}
            </div>
            <button
              onClick={() => {
                if (setShowRematchOffer) {
                  setTimeout(() => {
                    setShowRematchOffer(true);
                  }, 500);
                }
              }}
              className="p-2 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 ml-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon name="RotateCcw" size={18} />
              <span className="font-semibold text-xs md:text-sm">Реванш</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};