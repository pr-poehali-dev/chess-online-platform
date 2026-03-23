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
  capturedPieces?: {type: string; color: string}[];
  ratingChange?: number | null;
  theme?: 'light' | 'dark';
  onClickProfile?: () => void;
}

import { pieceImages } from './gameTypes';

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
  inactivityTimer,
  capturedPieces = [],
  ratingChange,
  theme = 'dark',
  onClickProfile
}: PlayerInfoProps) => {
  const pieceOrder = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
  
  const groupedPieces = capturedPieces.reduce((acc, piece) => {
    const key = piece.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(piece);
    return acc;
  }, {} as Record<string, {type: string; color: string}[]>);
  
  const sortedGroups = pieceOrder
    .filter(type => groupedPieces[type])
    .map(type => groupedPieces[type]);
  return (
    <div className={`backdrop-blur-sm rounded-md sm:rounded-lg p-0.5 sm:p-2 border w-full md:w-auto ${
      theme === 'light' 
        ? (playerColor === 'black' ? 'bg-stone-700/80 border-stone-600' : 'bg-white/80 border-slate-300')
        : (playerColor === 'black' ? 'bg-stone-900/80 border-stone-700' : 'bg-stone-200/90 border-stone-400')
    }`}>
      <div className="flex items-center justify-between h-full">
        <div
          className={`flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink ${onClickProfile ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''}`}
          onClick={onClickProfile}
        >
          {avatar ? (
            <img 
              src={avatar} 
              alt={playerName}
              className="w-5 h-5 sm:w-8 sm:h-8 rounded-full object-cover border sm:border-2 border-stone-600 flex-shrink-0"
            />
          ) : (
            <div className="text-2xl sm:text-3xl flex-shrink-0">{icon}</div>
          )}
          <div className="min-w-0 flex-shrink">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className={`text-sm sm:text-base font-semibold truncate ${
                playerColor === 'white' ? 'text-slate-800' : 'text-white'
              }`}>
                {playerName}{difficulty && ` (${difficulty})`}
              </div>
              {rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                    playerColor === 'white' ? 'text-orange-600' : 'text-orange-400'
                  }`}>
                    {rating}
                  </div>
                  {ratingChange != null && ratingChange !== 0 && (
                    <div className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                      ratingChange > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {ratingChange > 0 ? `+${ratingChange}` : ratingChange}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 mx-2 overflow-hidden flex-shrink min-w-0" style={{ maxWidth: '30%' }}>
          {capturedPieces.length > 0 && sortedGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="relative flex items-center flex-shrink-0" style={{ height: '1.5em' }}>
              {group.map((piece, index) => (
                <img
                  key={index}
                  src={pieceImages[piece.color]?.[piece.type]}
                  alt={`${piece.color} ${piece.type}`}
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6"
                  style={{ 
                    marginLeft: index > 0 ? '-0.3em' : '0',
                    zIndex: index,
                    position: 'relative'
                  }}
                  draggable={false}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {inactivityTimer !== undefined && inactivityTimer <= 20 && (
              <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${
                inactivityTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-400'
              }`}>
                До поражения
              </span>
            )}
            {inactivityTimer !== undefined && inactivityTimer <= 30 && (
              <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${
                inactivityTimer <= 10 ? 'text-red-500 animate-pulse' : inactivityTimer <= 20 ? 'text-orange-400' : 'text-yellow-500'
              }`}>
                ({inactivityTimer}с)
              </span>
            )}
            <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${
              time <= 30 ? 'text-red-500 animate-pulse' : time <= 60 ? 'text-red-500' : isCurrentPlayer
                ? (playerColor === 'white' ? 'text-green-600' : 'text-green-400')
                : (playerColor === 'white' ? 'text-stone-500' : 'text-stone-400')
            }`}>
              {formatTime(time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};