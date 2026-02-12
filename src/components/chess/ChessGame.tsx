import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Piece = {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
};

type Board = (Piece | null)[][];
type Position = { row: number; col: number };

interface ChessGameProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  timeControl: 'blitz' | 'rapid' | 'classic';
  onClose: () => void;
}

const initialBoard: Board = [
  [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' }, { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' } as Piece)),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' } as Piece)),
  [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' }, { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
  ]
];

const pieceSymbols: Record<string, Record<string, string>> = {
  white: {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
  },
  black: {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
  }
};

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

  const isValidMove = (from: Position, to: Position, piece: Piece): boolean => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const targetPiece = board[to.row][to.col];

    if (targetPiece && targetPiece.color === piece.color) return false;

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (dx === 0 && !targetPiece) {
          if (dy === direction) return true;
          if (from.row === startRow && dy === direction * 2 && !board[from.row + direction][from.col]) return true;
        }
        
        if (Math.abs(dx) === 1 && dy === direction && targetPiece) return true;
        return false;
      }

      case 'knight':
        return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);

      case 'bishop':
        if (Math.abs(dx) !== Math.abs(dy)) return false;
        return !isPathBlocked(from, to);

      case 'rook':
        if (dx !== 0 && dy !== 0) return false;
        return !isPathBlocked(from, to);

      case 'queen':
        if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;
        return !isPathBlocked(from, to);

      case 'king':
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

      default:
        return false;
    }
  };

  const isPathBlocked = (from: Position, to: Position): boolean => {
    const dx = Math.sign(to.col - from.col);
    const dy = Math.sign(to.row - from.row);
    let x = from.col + dx;
    let y = from.row + dy;

    while (x !== to.col || y !== to.row) {
      if (board[y][x]) return true;
      x += dx;
      y += dy;
    }
    return false;
  };

  const getPossibleMoves = (pos: Position): Position[] => {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(pos, { row, col }, piece)) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
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
    const moves = getAllPossibleMoves('black');
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
        selectedMove = getBestMove(moves, false);
        break;
      case 'master':
        selectedMove = getBestMove(moves, true);
        break;
      default:
        selectedMove = moves[0];
    }

    makeMove(selectedMove.from, selectedMove.to);
  };

  const getAllPossibleMoves = (color: 'white' | 'black'): { from: Position; to: Position }[] => {
    const moves: { from: Position; to: Position }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const pieceMoves = getPossibleMoves({ row, col });
          pieceMoves.forEach(to => {
            moves.push({ from: { row, col }, to });
          });
        }
      }
    }
    return moves;
  };

  const evaluatePosition = (testBoard: Board, color: 'white' | 'black'): number => {
    const pieceValues: Record<string, number> = {
      pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000
    };

    const pawnTable = [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ];

    const knightTable = [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ];

    const bishopTable = [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [-10,  5,  5, 10, 10,  5,  5,-10],
      [-10,  0, 10, 10, 10, 10,  0,-10],
      [-10, 10, 10, 10, 10, 10, 10,-10],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20]
    ];

    const rookTable = [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [5, 10, 10, 10, 10, 10, 10,  5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [0,  0,  0,  5,  5,  0,  0,  0]
    ];

    const queenTable = [
      [-20,-10,-10, -5, -5,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [-5,  0,  5,  5,  5,  5,  0, -5],
      [0,  0,  5,  5,  5,  5,  0, -5],
      [-10,  5,  5,  5,  5,  5,  0,-10],
      [-10,  0,  5,  0,  0,  0,  0,-10],
      [-20,-10,-10, -5, -5,-10,-10,-20]
    ];

    const kingTable = [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [20, 20,  0,  0,  0,  0, 20, 20],
      [20, 30, 10,  0,  0, 10, 30, 20]
    ];

    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col];
        if (!piece) continue;

        const pieceScore = pieceValues[piece.type];
        let positionScore = 0;

        const adjustedRow = piece.color === 'white' ? 7 - row : row;

        switch (piece.type) {
          case 'pawn':
            positionScore = pawnTable[adjustedRow][col];
            break;
          case 'knight':
            positionScore = knightTable[adjustedRow][col];
            break;
          case 'bishop':
            positionScore = bishopTable[adjustedRow][col];
            break;
          case 'rook':
            positionScore = rookTable[adjustedRow][col];
            break;
          case 'queen':
            positionScore = queenTable[adjustedRow][col];
            break;
          case 'king':
            positionScore = kingTable[adjustedRow][col];
            break;
        }

        if (piece.color === color) {
          score += pieceScore + positionScore;
        } else {
          score -= pieceScore + positionScore;
        }
      }
    }

    return score;
  };

  const getBestMove = (moves: { from: Position; to: Position }[], isDifficult: boolean): { from: Position; to: Position } => {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    moves.forEach(move => {
      const testBoard = board.map(row => [...row]);
      const piece = testBoard[move.from.row][move.from.col];
      
      if (!piece) return;

      testBoard[move.to.row][move.to.col] = piece;
      testBoard[move.from.row][move.from.col] = null;

      let score = evaluatePosition(testBoard, 'black');

      if (isDifficult) {
        const opponentMoves = getAllPossibleMovesForBoard(testBoard, 'white');
        if (opponentMoves.length > 0) {
          let worstResponse = Infinity;
          opponentMoves.slice(0, 5).forEach(oppMove => {
            const testBoard2 = testBoard.map(row => [...row]);
            const oppPiece = testBoard2[oppMove.from.row][oppMove.from.col];
            if (oppPiece) {
              testBoard2[oppMove.to.row][oppMove.to.col] = oppPiece;
              testBoard2[oppMove.from.row][oppMove.from.col] = null;
              const oppScore = evaluatePosition(testBoard2, 'black');
              worstResponse = Math.min(worstResponse, oppScore);
            }
          });
          score = worstResponse;
        }
        score += Math.random() * 5;
      } else {
        score += Math.random() * 50;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove;
  };

  const getAllPossibleMovesForBoard = (testBoard: Board, color: 'white' | 'black'): { from: Position; to: Position }[] => {
    const moves: { from: Position; to: Position }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col];
        if (piece && piece.color === color) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (isValidMoveForBoard(testBoard, { row, col }, { row: toRow, col: toCol }, piece)) {
                moves.push({ from: { row, col }, to: { row: toRow, col: toCol } });
              }
            }
          }
        }
      }
    }
    return moves;
  };

  const isValidMoveForBoard = (testBoard: Board, from: Position, to: Position, piece: Piece): boolean => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const targetPiece = testBoard[to.row][to.col];

    if (targetPiece && targetPiece.color === piece.color) return false;

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (dx === 0 && !targetPiece) {
          if (dy === direction) return true;
          if (from.row === startRow && dy === direction * 2) {
            const middleRow = from.row + direction;
            if (!testBoard[middleRow][from.col]) return true;
          }
        }
        
        if (Math.abs(dx) === 1 && dy === direction && targetPiece) return true;
        return false;
      }
      case 'knight':
        return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
      case 'bishop':
        if (Math.abs(dx) !== Math.abs(dy)) return false;
        return !isPathBlockedForBoard(testBoard, from, to);
      case 'rook':
        if (dx !== 0 && dy !== 0) return false;
        return !isPathBlockedForBoard(testBoard, from, to);
      case 'queen':
        if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;
        return !isPathBlockedForBoard(testBoard, from, to);
      case 'king':
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      default:
        return false;
    }
  };

  const isPathBlockedForBoard = (testBoard: Board, from: Position, to: Position): boolean => {
    const dx = Math.sign(to.col - from.col);
    const dy = Math.sign(to.row - from.row);
    let x = from.col + dx;
    let y = from.row + dy;

    while (x !== to.col || y !== to.row) {
      if (testBoard[y][x]) return true;
      x += dx;
      y += dy;
    }
    return false;
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
        setPossibleMoves(getPossibleMoves({ row, col }));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === 'white') {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves({ row, col }));
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

              <div className="inline-block rounded-sm overflow-hidden shadow-2xl relative" style={{ 
                boxShadow: '0 0 0 4px #3e2723, 0 0 0 6px #5d4037, 0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <div className="grid grid-cols-8 gap-0" style={{ width: '480px', height: '480px' }}>
                  {board.map((row, rowIndex) => (
                    row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      const isSelected = isSquareSelected(rowIndex, colIndex);
                      const isPossible = isSquarePossibleMove(rowIndex, colIndex);
                      const fileLabel = String.fromCharCode(97 + colIndex);
                      const rankLabel = (8 - rowIndex).toString();
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          className={`
                            relative flex items-center justify-center cursor-pointer select-none
                            ${isSelected ? 'ring-4 ring-inset ring-yellow-400 z-10' : ''}
                            ${isPossible ? 'ring-4 ring-inset ring-green-400 z-10' : ''}
                            hover:brightness-110 transition-all
                          `}
                          style={{ 
                            width: '60px', 
                            height: '60px',
                            background: isLight 
                              ? 'linear-gradient(135deg, #f0d9b5 0%, #e8d1ad 100%)'
                              : 'linear-gradient(135deg, #b58863 0%, #a0745f 100%)',
                            boxShadow: isLight 
                              ? 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.05)'
                              : 'inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {colIndex === 0 && (
                            <span 
                              className="absolute top-0.5 left-1 text-xs font-semibold pointer-events-none"
                              style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
                            >
                              {rankLabel}
                            </span>
                          )}
                          {rowIndex === 7 && (
                            <span 
                              className="absolute bottom-0.5 right-1 text-xs font-semibold pointer-events-none"
                              style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
                            >
                              {fileLabel}
                            </span>
                          )}
                          {piece && (
                            <div 
                              className="text-5xl font-bold"
                              style={{
                                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
                                color: piece.color === 'white' ? '#ffffff' : '#2c2c2c',
                                WebkitTextStroke: piece.color === 'white' ? '1px #e0e0e0' : '1px #000000'
                              }}
                            >
                              {pieceSymbols[piece.color][piece.type]}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>

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