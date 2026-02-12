import { formatTime, getDifficultyLabel } from './gameTypes';

interface GameUIProps {
  difficulty: string;
  blackTime: number;
  whiteTime: number;
  currentPlayer: 'white' | 'black';
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  moveHistory: string[];
}

export const GameUI = ({ 
  difficulty, 
  blackTime, 
  whiteTime, 
  currentPlayer, 
  gameStatus, 
  moveHistory 
}: GameUIProps) => {
  return (
    <>
      <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-4 border border-stone-700/30 w-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">♚</div>
            <div>
              <div className="text-sm font-medium text-stone-200">
                Компьютер ({getDifficultyLabel(difficulty)})
              </div>
              <div className="text-xs text-stone-400">Черные</div>
            </div>
          </div>
          <div className={`text-2xl font-bold ${currentPlayer === 'black' ? 'text-green-400' : 'text-stone-400'}`}>
            {formatTime(blackTime)}
          </div>
        </div>
      </div>

      <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-4 border border-stone-700/30 w-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">♔</div>
            <div>
              <div className="text-sm font-medium text-stone-200">Вы</div>
              <div className="text-xs text-stone-400">Белые</div>
            </div>
          </div>
          <div className={`text-2xl font-bold ${currentPlayer === 'white' ? 'text-green-400' : 'text-stone-400'}`}>
            {formatTime(whiteTime)}
          </div>
        </div>
      </div>

      {gameStatus !== 'playing' && (
        <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-500/50">
          <div className="text-lg font-bold text-white">
            {gameStatus === 'checkmate' && currentPlayer === 'white' && 'Вы проиграли!'}
            {gameStatus === 'checkmate' && currentPlayer === 'black' && 'Вы победили!'}
            {gameStatus === 'stalemate' && 'Ничья - пат'}
            {gameStatus === 'draw' && 'Ничья'}
          </div>
        </div>
      )}

      <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg border border-stone-700/30 w-72 h-[700px] flex flex-col">
        <div className="px-4 py-3 border-b border-stone-700/30">
          <h3 className="text-sm font-semibold text-stone-200">История ходов</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {moveHistory.length === 0 ? (
            <div className="text-sm text-stone-500 text-center py-8">
              Ходы будут отображаться здесь
            </div>
          ) : (
            moveHistory.map((move, index) => (
              <div 
                key={index} 
                className="text-sm text-stone-200 px-3 py-1.5 bg-stone-700/30 rounded hover:bg-stone-700/50 transition-colors"
              >
                <span className="text-stone-400 mr-2">{Math.floor(index / 2) + 1}.</span>
                {move}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
