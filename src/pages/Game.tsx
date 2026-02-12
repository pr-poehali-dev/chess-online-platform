import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Board, Position, initialBoard, getInitialTime, getDifficultyLabel, formatTime } from './game/gameTypes';
import { getPossibleMoves, getAllPossibleMovesForBoard, getBestMove } from './game/gameLogic';
import { GameBoard } from './game/GameBoard';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'medium') as 'easy' | 'medium' | 'hard' | 'master';
  const timeControl = (searchParams.get('time') || 'blitz') as 'blitz' | 'rapid' | 'classic';

  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [whiteTime, setWhiteTime] = useState(getInitialTime(timeControl));
  const [blackTime, setBlackTime] = useState(getInitialTime(timeControl));
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      if (currentPlayer === 'white') {
        setWhiteTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus]);

  useEffect(() => {
    if (currentPlayer === 'black' && gameStatus === 'playing') {
      setTimeout(() => makeComputerMove(), 500);
    }
  }, [currentPlayer, gameStatus]);

  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    const moveNotation = `${String.fromCharCode(97 + from.col)}${8 - from.row}-${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    setMoveHistory(prev => [...prev, moveNotation]);
    
    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollLeft = historyRef.current.scrollWidth;
      }
    }, 10);

    setBoard(newBoard);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
  };

  const makeComputerMove = () => {
    const moves = getAllPossibleMovesForBoard(board, 'black');
    if (moves.length === 0) {
      setGameStatus('checkmate');
      return;
    }

    let selectedMove;
    switch (difficulty) {
      case 'easy':
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
        break;
      case 'medium':
        selectedMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];
        break;
      case 'hard':
        selectedMove = getBestMove(board, moves, false);
        break;
      case 'master':
        selectedMove = getBestMove(board, moves, true);
        break;
      default:
        selectedMove = moves[0];
    }

    makeMove(selectedMove.from, selectedMove.to);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (currentPlayer !== 'white' || gameStatus !== 'playing') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const isValidTarget = possibleMoves.some(m => m.row === row && m.col === col);
      
      if (isValidTarget) {
        makeMove(selectedSquare, { row, col });
      } else if (piece && piece.color === 'white') {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(board, { row, col }));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === 'white') {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(board, { row, col }));
    }
  };

  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isSquarePossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(m => m.row === row && m.col === col);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!historyRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - historyRef.current.offsetLeft);
    setScrollLeft(historyRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !historyRef.current) return;
    e.preventDefault();
    const x = e.pageX - historyRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    historyRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleSurrender = () => {
    setGameStatus('checkmate');
    setShowExitDialog(false);
  };

  const handleContinue = () => {
    setShowExitDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col">
      <header className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50 px-4 py-3 flex items-center justify-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-wide" style={{
          fontFamily: 'Montserrat, sans-serif',
          textShadow: '0 2px 10px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2)',
          letterSpacing: '0.05em'
        }}>
          ЛигаШахмат
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4">
        <div className="flex flex-col gap-3 md:gap-6 w-full max-w-[1200px] items-center">
            <button
              onClick={handleExitClick}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors text-sm"
            >
              <Icon name="LogOut" size={18} />
              <span className="font-medium">Выход из игры</span>
            </button>

            <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-stone-700/30 w-full max-w-[400px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-3xl md:text-4xl">♚</div>
                  <div>
                    <div className="text-xs md:text-sm font-medium text-stone-200">
                      Компьютер ({getDifficultyLabel(difficulty)})
                    </div>
                    <div className="text-xs text-stone-400">Черные</div>
                  </div>
                </div>
                <div className={`text-xl md:text-2xl font-bold ${currentPlayer === 'black' ? 'text-green-400' : 'text-stone-400'}`}>
                  {formatTime(blackTime)}
                </div>
              </div>
            </div>

            <GameBoard
              board={board}
              onSquareClick={handleSquareClick}
              isSquareSelected={isSquareSelected}
              isSquarePossibleMove={isSquarePossibleMove}
            />

            <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-stone-700/30 w-full max-w-[400px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-3xl md:text-4xl">♔</div>
                  <div>
                    <div className="text-xs md:text-sm font-medium text-stone-200">Вы</div>
                    <div className="text-xs text-stone-400">Белые</div>
                  </div>
                </div>
                <div className={`text-xl md:text-2xl font-bold ${currentPlayer === 'white' ? 'text-green-400' : 'text-stone-400'}`}>
                  {formatTime(whiteTime)}
                </div>
              </div>
            </div>

            {gameStatus !== 'playing' && (
              <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-500/50 w-full max-w-[400px]">
                <div className="text-lg font-bold text-white">
                  {gameStatus === 'checkmate' && currentPlayer === 'white' && 'Вы проиграли!'}
                  {gameStatus === 'checkmate' && currentPlayer === 'black' && 'Вы победили!'}
                  {gameStatus === 'stalemate' && 'Ничья - пат'}
                  {gameStatus === 'draw' && 'Ничья'}
                </div>
              </div>
            )}

          <div className="w-full max-w-[400px] relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-900 to-transparent z-10 pointer-events-none"></div>
            <div 
              ref={historyRef} 
              className="overflow-x-auto hide-scrollbar bg-stone-800/50 backdrop-blur-sm rounded-lg border border-stone-700/30 p-3"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <div className={`flex gap-3 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                {moveHistory.length === 0 ? (
                  <div className="text-xs text-stone-500 whitespace-nowrap">
                    Ходы появятся здесь
                  </div>
                ) : (
                  moveHistory.map((move, index) => (
                    <div 
                      key={index} 
                      className="text-xs text-stone-300 whitespace-nowrap flex-shrink-0"
                    >
                      <span className="text-stone-500 mr-1">{Math.floor(index / 2) + 1}.</span>
                      {move}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showExitDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-xl border border-stone-700 p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-stone-100 mb-2">Выход из игры</h2>
              <p className="text-stone-400">
                Вы уверены, что хотите сдаться и выйти из игры? Это будет засчитано как поражение.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-medium transition-colors"
              >
                Продолжить игру
              </button>
              <button
                onClick={handleSurrender}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Сдаться
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;