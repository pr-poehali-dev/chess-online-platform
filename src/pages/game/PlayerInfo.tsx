interface PlayerInfoProps {
  playerName: string;
  playerColor: 'white' | 'black';
  icon: string;
  time: number;
  isCurrentPlayer: boolean;
  formatTime: (seconds: number) => string;
  difficulty?: string;
}

export const PlayerInfo = ({
  playerName,
  playerColor,
  icon,
  time,
  isCurrentPlayer,
  formatTime,
  difficulty
}: PlayerInfoProps) => {
  return (
    <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-stone-700/30 w-full max-w-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-3xl md:text-4xl">{icon}</div>
          <div>
            <div className="text-xs md:text-sm font-medium text-stone-200">
              {playerName}{difficulty && ` (${difficulty})`}
            </div>
            <div className="text-xs text-stone-400">
              {playerColor === 'white' ? 'Белые' : 'Черные'}
            </div>
          </div>
        </div>
        <div className={`text-xl md:text-2xl font-bold ${
          time <= 60 ? 'text-red-500 animate-pulse' : isCurrentPlayer ? 'text-green-400' : 'text-stone-400'
        }`}>
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};