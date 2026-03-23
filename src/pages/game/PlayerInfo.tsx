interface PlayerInfoProps {
  playerName: string;
  playerColor: 'white' | 'black';
  icon: string;
  time: number;
  isCurrentPlayer: boolean;
  formatTime: (seconds: number) => string;
  difficulty?: string;
  rating?: number;
  city?: string;
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
  city,
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
              {city && (
                <div className={`text-xs whitespace-nowrap flex-shrink-0 ${
                  playerColor === 'white' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  📍 {city}
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
        <div className="flex-shrink-0">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.125rem', fontWeight: 700 }}>
            {inactivityTimer !== undefined && inactivityTimer <= 20 && (
              <span style={{ whiteSpace: 'nowrap', color: inactivityTimer <= 10 ? '#ef4444' : '#fb923c' }}>
                До поражения
              </span>
            )}
            {inactivityTimer !== undefined && inactivityTimer <= 30 && (
              <span style={{ whiteSpace: 'nowrap', color: inactivityTimer <= 10 ? '#ef4444' : inactivityTimer <= 20 ? '#fb923c' : '#eab308' }}>
                ({inactivityTimer}с)
              </span>
            )}
            <span style={{ whiteSpace: 'nowrap', color: time <= 60 ? '#ef4444' : isCurrentPlayer ? (playerColor === 'white' ? '#16a34a' : '#4ade80') : (playerColor === 'white' ? '#78716c' : '#a8a29e') }}
              className={time <= 30 ? 'animate-pulse' : ''}>
              {formatTime(time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};