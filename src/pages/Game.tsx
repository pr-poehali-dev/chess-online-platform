import { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col">
      <header className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors"
        >
          <Icon name="ArrowLeft" size={20} />
          <span className="text-sm font-medium">Назад</span>
        </button>
        <div className="text-stone-200 text-sm font-medium">
          Игра с компьютером • {getDifficultyLabel(difficulty)}
        </div>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex gap-6 items-start">
          <div className="flex flex-col gap-6">
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

            <GameBoard
              board={board}
              onSquareClick={handleSquareClick}
              isSquareSelected={isSquareSelected}
              isSquarePossibleMove={isSquarePossibleMove}
            />

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
          </div>

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
        </div>
      </main>
    </div>
  );
};

export default Game;