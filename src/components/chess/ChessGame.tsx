import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Board, Position, initialBoard } from './game/chessTypes';
import { 
  isValidMove, 
  getPossibleMoves, 
  getAllPossibleMoves, 
  getBestMove 
} from './game/chessLogic';
import { ChessBoard } from './game/ChessBoard';

interface ChessGameProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  timeControl: 'blitz' | 'rapid' | 'classic';
  onClose: () => void;
}

export const ChessGame = ({ difficulty, timeControl, onClose }: ChessGameProps) => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [whiteTime, setWhiteTime] = useState(getInitialTime(timeControl));
  const [blackTime, setBlackTime] = useState(getInitialTime(timeControl));
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  function getInitialTime(control: string): number {
    switch (control) {
      case 'blitz': return 180;
      case 'rapid': return 600;
      case 'classic': return 900;
      default: return 600;
    }
  }

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    const moves = getAllPossibleMoves(board, 'black');
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Игра с компьютером</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={24} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full max-w-lg bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">♚</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Компьютер ({difficulty})</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">{formatTime(blackTime)}</div>
                  </div>
                </div>
              </div>

              <ChessBoard
                board={board}
                selectedSquare={selectedSquare}
                possibleMoves={possibleMoves}
                onSquareClick={handleSquareClick}
                isSquareSelected={isSquareSelected}
                isSquarePossibleMove={isSquarePossibleMove}
              />

              <div className="flex items-center justify-between w-full max-w-lg bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">♔</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Вы</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">{formatTime(whiteTime)}</div>
                  </div>
                </div>
              </div>

              {gameStatus !== 'playing' && (
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                    {gameStatus === 'checkmate' && currentPlayer === 'white' && 'Вы проиграли!'}
                    {gameStatus === 'checkmate' && currentPlayer === 'black' && 'Вы победили!'}
                    {gameStatus === 'stalemate' && 'Ничья - пат'}
                    {gameStatus === 'draw' && 'Ничья'}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">История ходов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {moveHistory.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-gray-400 text-center py-4">
                  Ходы будут отображаться здесь
                </div>
              ) : (
                moveHistory.map((move, index) => (
                  <div key={index} className="text-sm text-slate-900 dark:text-white p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                    {Math.floor(index / 2) + 1}. {move}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
