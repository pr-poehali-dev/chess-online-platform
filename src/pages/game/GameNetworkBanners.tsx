import Icon from '@/components/ui/icon';

interface GameNetworkBannersProps {
  isOnlineReal: boolean;
  connectionLost: boolean;
  connectionRestored: boolean;
  opponentReconnecting: boolean;
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  diverseStreakTriggered: boolean;
  streakCount: number;
  streakBonusAmount: number;
}

export const GameNetworkBanners = ({
  isOnlineReal,
  connectionLost,
  connectionRestored,
  opponentReconnecting,
  gameStatus,
  diverseStreakTriggered,
  streakCount,
  streakBonusAmount,
}: GameNetworkBannersProps) => {
  return (
    <>
      {isOnlineReal && connectionLost && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center text-sm py-2 font-semibold animate-pulse">
          <Icon name="WifiOff" size={16} className="inline mr-2 -mt-0.5" />
          Потеря связи с сервером...
        </div>
      )}
      {isOnlineReal && connectionRestored && !connectionLost && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white text-center text-sm py-2 font-semibold">
          <Icon name="Wifi" size={16} className="inline mr-2 -mt-0.5" />
          Связь восстановлена
        </div>
      )}
      {isOnlineReal && opponentReconnecting && !connectionLost && gameStatus === 'playing' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center text-sm py-2 font-semibold animate-pulse">
          <Icon name="RefreshCw" size={16} className="inline mr-2 -mt-0.5" />
          Соперник переподключается...
        </div>
      )}
      {diverseStreakTriggered && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 max-w-sm">
            <span className="text-3xl">{streakCount >= 5 ? '🏆' : '🔥'}</span>
            <div>
              <div className="font-bold text-base leading-tight">Серия побед!</div>
              <div className="text-sm font-medium opacity-90">{streakCount} {streakCount >= 5 ? 'побед подряд' : 'победы подряд'}</div>
              <div className="text-lg font-black">+{streakBonusAmount} к рейтингу</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
