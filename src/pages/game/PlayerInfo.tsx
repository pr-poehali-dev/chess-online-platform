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
  theme?: 'light' | 'dark';
}

const pieceSymbols: Record<string, Record<string, string>> = {
  'white': {
    'pawn': '♙',
    'knight': '♘',
    'bishop': '♗',
    'rook': '♖',
    'queen': '♕',
    'king': '♔'
  },
  'black': {
    'pawn': '♟',
    'knight': '♞',
    'bishop': '♝',
    'rook': '♜',
    'queen': '♛',
    'king': '♚'
  }
};

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
  theme = 'dark'
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
    <div className={`backdrop-blur-sm rounded-lg p-3 md:p-4 border w-full min-h-[76px] md:min-h-[88px] ${
      theme === 'light' 
        ? 'bg-white/80 border-slate-300' 
        : 'bg-stone-800/50 border-stone-700/30'
    }`}>
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
          {avatar ? (
            <img 
              src={avatar} 
              alt={playerName}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-stone-600 flex-shrink-0"
            />
          ) : (
            <div className="text-3xl md:text-4xl flex-shrink-0">{icon}</div>
          )}
          <div className="min-w-0 flex-shrink">
            <div className={`text-xs md:text-sm font-medium truncate ${
              theme === 'light' ? 'text-slate-800' : 'text-stone-200'
            }`}>
              {playerName}{difficulty && ` (${difficulty})`}
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs whitespace-nowrap ${
                theme === 'light' ? 'text-slate-600' : 'text-stone-400'
              }`}>
                {playerColor === 'white' ? 'Белые' : 'Черные'}
              </div>
              {rating && (
                <div className={`text-xs font-semibold whitespace-nowrap ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}>
                  {rating}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 mx-2 overflow-hidden flex-shrink min-w-0" style={{ maxWidth: '30%' }}>
          {capturedPieces.length > 0 && sortedGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="relative flex items-center flex-shrink-0" style={{ height: '1.5em' }}>
              {group.map((piece, index) => (
                <span 
                  key={index} 
                  className={`text-xl md:text-2xl ${
                    piece.color === 'white' ? 'text-stone-200' : 'text-stone-500'
                  }`}
                  style={{ 
                    marginLeft: index > 0 ? '-0.4em' : '0',
                    zIndex: index 
                  }}
                >
                  {pieceSymbols[piece.color][piece.type]}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`text-xl md:text-2xl font-bold whitespace-nowrap ${
              time <= 30 ? 'text-red-500 animate-pulse' : time <= 60 ? 'text-red-500' : isCurrentPlayer ? 'text-green-400' : 'text-stone-400'
            }`}>
              {formatTime(time)}
            </div>
            {inactivityTimer !== undefined && inactivityTimer <= 20 && (
              <div className={`text-sm md:text-base font-semibold whitespace-nowrap ${
                inactivityTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-400'
              }`}>
                ({inactivityTimer}с)
              </div>
            )}
          </div>
          {inactivityTimer !== undefined && inactivityTimer <= 20 && (
            <div className={`text-[10px] md:text-xs text-right whitespace-nowrap ${
              inactivityTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-400'
            }`}>
              Бездействие игрока. До поражения.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};