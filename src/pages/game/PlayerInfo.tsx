interface PlayerInfoProps {
  playerName: string;
  playerColor: 'white' | 'black';
  icon: string;
  time: number;
  isCurrentPlayer: boolean;
  formatTime: (seconds: number) => string;
  difficulty?: string;
  rating?: number;
  avatar?: string;
  inactivityTimer?: number;
}

export const PlayerInfo = ({
  playerName,
  playerColor,
  icon,
  time,
  isCurrentPlayer,
  formatTime,
  difficulty,
  rating,
  avatar,
  inactivityTimer
}: PlayerInfoProps) => {
  return (
    <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-stone-700/30 w-full max-w-[400px] md:max-w-[560px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {avatar ? (
            <img 
              src={avatar} 
              alt={playerName}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-stone-600"
            />
          ) : (
            <div className="text-3xl md:text-4xl">{icon}</div>
          )}
          <div>
            <div className="text-xs md:text-sm font-medium text-stone-200">
              {playerName}{difficulty && ` (${difficulty})`}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-stone-400">
                {playerColor === 'white' ? 'Белые' : 'Черные'}
              </div>
              {rating && (
                <div className="text-xs font-semibold text-blue-400">
                  {rating}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xl md:text-2xl font-bold ${
            time <= 30 ? 'text-red-500 animate-pulse' : time <= 60 ? 'text-red-500' : isCurrentPlayer ? 'text-green-400' : 'text-stone-400'
          }`}>
            {formatTime(time)}
          </div>
          {inactivityTimer !== undefined && inactivityTimer <= 20 && (
            <div className={`text-sm md:text-base font-semibold ${
              inactivityTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-400'
            }`}>
              ({inactivityTimer}с)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};