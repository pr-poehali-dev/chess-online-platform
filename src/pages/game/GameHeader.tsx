import Icon from "@/components/ui/icon";
import { BoardTheme, boardThemes } from "./gameTypes";
import type { P2PQuality } from "./usePeerConnection";

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
  theme?: "light" | "dark";
  setTheme?: (value: "light" | "dark") => void;
  boardTheme?: BoardTheme;
  setBoardTheme?: (value: BoardTheme) => void;
  gameStatus?: "playing" | "checkmate" | "stalemate" | "draw";
  currentPlayer?: "white" | "black";
  playerColor?: "white" | "black";
  setShowRematchOffer?: (value: boolean) => void;
  onOfferRematch?: () => void;
  rematchSent?: boolean;
  rematchCooldown?: boolean;
  isOnline?: boolean;
  p2pConnected?: boolean;
  p2pQuality?: P2PQuality;
  p2pLatency?: number | null;
  connectionLost?: boolean;
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
  theme,
}: GameHeaderProps) => {
  return (
    <header
      className={`backdrop-blur-sm border-b px-4 py-1.5 sm:py-2 md:py-3 flex items-center justify-center flex-shrink-0 ${
        theme === "light"
          ? "bg-white/80 border-slate-300"
          : "bg-stone-900/80 border-stone-700/50"
      }`}
    >
      <h1
        className={`text-lg sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r tracking-wide ${
          theme === "light"
            ? "from-amber-600 via-yellow-500 to-amber-600"
            : "from-amber-200 via-yellow-400 to-amber-200"
        }`}
        style={{
          fontFamily: "Montserrat, sans-serif",
          textShadow:
            theme === "light"
              ? "0 2px 10px rgba(217, 119, 6, 0.2), 0 0 30px rgba(217, 119, 6, 0.1)"
              : "0 2px 10px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2)",
          letterSpacing: "0.05em",
        }}
      >
        Лига Шахмат
      </h1>
    </header>
  );
};

const P2PIndicator = ({ isOnline, p2pConnected, p2pQuality, p2pLatency, connectionLost, theme }: {
  isOnline?: boolean; p2pConnected?: boolean; p2pQuality?: P2PQuality; p2pLatency?: number | null; connectionLost?: boolean; theme?: "light" | "dark";
}) => {
  if (!isOnline) return null;

  const getConfig = () => {
    if (connectionLost) return { color: 'text-red-500', bars: 0, label: 'Нет связи', bg: theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-950/40 border-red-800/50' };
    if (!p2pConnected) return { color: theme === 'light' ? 'text-amber-600' : 'text-amber-400', bars: 1, label: 'Сервер', bg: theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/40 border-amber-800/50' };
    if (p2pQuality === 'excellent') return { color: 'text-emerald-500', bars: 3, label: p2pLatency ? `${p2pLatency}ms` : 'P2P', bg: theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/50' };
    if (p2pQuality === 'good') return { color: theme === 'light' ? 'text-green-600' : 'text-green-400', bars: 2, label: p2pLatency ? `${p2pLatency}ms` : 'P2P', bg: theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-950/40 border-green-800/50' };
    return { color: theme === 'light' ? 'text-orange-600' : 'text-orange-400', bars: 1, label: p2pLatency ? `${p2pLatency}ms` : 'P2P', bg: theme === 'light' ? 'bg-orange-50 border-orange-200' : 'bg-orange-950/40 border-orange-800/50' };
  };

  const { color, bars, label, bg } = getConfig();
  const barH = [6, 10, 14];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs font-medium flex-shrink-0 ${bg} ${color}`} title={`Соединение: ${p2pConnected ? 'P2P прямое' : connectionLost ? 'потеряно' : 'через сервер'}${p2pLatency ? ` (${p2pLatency}ms)` : ''}`}>
      <div className="flex items-end gap-[2px] h-[14px]">
        {barH.map((h, i) => (
          <div key={i} className={`w-[3px] rounded-sm transition-all duration-300 ${i < bars ? (connectionLost ? 'bg-red-500' : p2pConnected ? 'bg-current' : 'bg-current') : (theme === 'light' ? 'bg-slate-300' : 'bg-stone-600')}`} style={{ height: `${h}px` }} />
        ))}
      </div>
      <span className="hidden sm:inline">{label}</span>
    </div>
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
  boardTheme,
  setBoardTheme,
  gameStatus,
  currentPlayer,
  playerColor,
  setShowRematchOffer,
  onOfferRematch,
  rematchSent,
  rematchCooldown,
  isOnline,
  p2pConnected,
  p2pQuality,
  p2pLatency,
  connectionLost,
}: GameHeaderProps) => {
  const isGameOver = gameStatus && gameStatus !== "playing";
  const themeKeys: BoardTheme[] = ["classic", "flat", "wood"];
  return (
    <div className="w-full md:w-auto h-[40px] sm:h-[48px] md:h-[56px]">
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 h-full">
        <button
          onClick={handleExitClick}
          className={`p-2 sm:p-3 md:p-2.5 border rounded-lg transition-colors min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center flex-shrink-0 ${
            theme === "light"
              ? "bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900"
              : "bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100"
          }`}
          title="Выход из игры"
        >
          <div className="rotate-180">
            <Icon name="LogOut" size={18} />
          </div>
        </button>
        <button
          onClick={() => setShowChat(true)}
          className={`p-2 sm:p-3 md:p-2.5 border rounded-lg transition-colors min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center flex-shrink-0 ${
            theme === "light"
              ? "bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900"
              : "bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100"
          }`}
          title="Чат"
        >
          <Icon name="MessageCircle" size={18} />
        </button>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={`p-2 sm:p-3 md:p-3 border rounded-lg transition-colors min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ${
              theme === "light"
                ? "bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900"
                : "bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100"
            }`}
            title="Опции"
          >
            <Icon name="Settings" size={18} />
          </button>
          {showSettingsMenu && (
            <>
              <div
                className={`fixed inset-0 z-40 md:bg-transparent ${
                  theme === "light" ? "bg-black/30" : "bg-black/50"
                }`}
                onClick={() => setShowSettingsMenu(false)}
              />
              <div
                className={`fixed md:absolute inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:right-0 md:mt-2 md:w-56 md:rounded-lg rounded-t-2xl shadow-xl border overflow-hidden z-50 md:animate-scale-in animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto ${
                  theme === "light"
                    ? "bg-white border-slate-300"
                    : "bg-stone-800 border-stone-700/50"
                }`}
              >
                <div className="md:hidden w-10 h-1 rounded-full bg-slate-300 dark:bg-stone-600 mx-auto mt-2 mb-1" />
                <button
                  onClick={() => {
                    if (setTheme) {
                      const newTheme = theme === "dark" ? "light" : "dark";
                      setTheme(newTheme);
                      localStorage.setItem("chessTheme", newTheme);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={theme === "dark" ? "Moon" : "Sun"} size={20} />
                    <span>
                      {theme === "dark" ? "Темная тема" : "Светлая тема"}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${theme === "light" ? "bg-amber-500" : "bg-stone-600"} relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${theme === "light" ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (setShowPossibleMoves) {
                      setShowPossibleMoves(!showPossibleMoves);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-t ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Eye" size={20} />
                    <span>Показывать ходы</span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${showPossibleMoves ? "bg-green-600" : "bg-stone-600"} relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showPossibleMoves ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </div>
                </button>
                <div
                  className={`px-4 py-3 border-t ${
                    theme === "light"
                      ? "border-slate-200"
                      : "border-stone-700/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 mb-2 ${
                      theme === "light" ? "text-slate-700" : "text-stone-300"
                    }`}
                  >
                    <Icon name="LayoutGrid" size={20} />
                    <span>Доска</span>
                  </div>
                  <div className="flex gap-1.5">
                    {themeKeys.map((key) => {
                      const cfg = boardThemes[key];
                      const isActive = boardTheme === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (setBoardTheme) {
                              setBoardTheme(key);
                              localStorage.setItem("chessBoardTheme", key);
                            }
                          }}
                          className={`flex-1 rounded-md overflow-hidden border-2 transition-all ${
                            isActive
                              ? "border-amber-400 scale-105"
                              : theme === "light"
                                ? "border-slate-300"
                                : "border-stone-600"
                          }`}
                          title={cfg.name}
                        >
                          <div className="grid grid-cols-4 aspect-square">
                            {Array.from({ length: 16 }).map((_, i) => {
                              const r = Math.floor(i / 4);
                              const c = i % 4;
                              const isL = (r + c) % 2 === 0;
                              return (
                                <div
                                  key={i}
                                  style={{
                                    backgroundColor: isL
                                      ? cfg.lightSquare
                                      : cfg.darkSquare,
                                  }}
                                />
                              );
                            })}
                          </div>
                          <div
                            className={`text-[9px] text-center py-0.5 ${
                              theme === "light"
                                ? "text-slate-600 bg-slate-50"
                                : "text-stone-400 bg-stone-700/50"
                            }`}
                          >
                            {cfg.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {!isGameOver && (
                  <>
                    <button
                      onClick={handleOfferDraw}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                        theme === "light"
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                          : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                      }`}
                    >
                      <Icon name="Handshake" size={20} />
                      <span>Предложить ничью</span>
                    </button>
                    <button
                      onClick={handleSurrender}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                        theme === "light"
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
                      }`}
                    >
                      <Icon name="Flag" size={20} />
                      <span>Сдаться</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowNotifications(true);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                  }`}
                >
                  <Icon name="Bell" size={20} />
                  <span>Уведомления</span>
                </button>
                <button
                  onClick={handleNewGame}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                  }`}
                >
                  <Icon name="Plus" size={20} />
                  <span>Новая партия</span>
                </button>
                <div className="md:hidden pb-[env(safe-area-inset-bottom,8px)]" />
              </div>
            </>
          )}
        </div>
        <P2PIndicator isOnline={isOnline} p2pConnected={p2pConnected} p2pQuality={p2pQuality} p2pLatency={p2pLatency} connectionLost={connectionLost} theme={theme} />
        {gameStatus !== "playing" && (
          <div
            className={`backdrop-blur-sm rounded-lg p-1.5 sm:p-2 md:p-3 border flex items-center justify-between flex-1 min-w-0 ml-1 md:ml-2 ${
              theme === "light"
                ? "bg-blue-500/90 border-blue-600"
                : "bg-blue-600/90 border-blue-700"
            }`}
          >
            <div className="text-[10px] sm:text-xs md:text-sm font-bold text-white truncate">
              {gameStatus === "checkmate" &&
                currentPlayer === playerColor &&
                "Поражение"}
              {gameStatus === "checkmate" &&
                currentPlayer !== playerColor &&
                "Победа"}
              {gameStatus === "stalemate" && "Ничья"}
              {gameStatus === "draw" && "Ничья"}
            </div>
            <button
              onClick={() => {
                if (rematchSent || rematchCooldown) return;
                if (onOfferRematch) {
                  onOfferRematch();
                } else if (setShowRematchOffer) {
                  setTimeout(() => {
                    setShowRematchOffer(true);
                  }, 500);
                }
              }}
              disabled={rematchSent || rematchCooldown}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ml-1 sm:ml-2 text-white ${
                rematchSent || rematchCooldown
                  ? "bg-stone-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <Icon name="RotateCcw" size={16} />
              <span className="font-semibold text-[10px] sm:text-xs md:text-sm">
                {rematchCooldown
                  ? "Недоступно"
                  : rematchSent
                    ? "Ожидание..."
                    : "Реванш"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};