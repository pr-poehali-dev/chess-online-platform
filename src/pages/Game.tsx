import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';

type Piece = {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
};

type Board = (Piece | null)[][];
type Position = { row: number; col: number };

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

  function getInitialTime(control: string): number {
    switch (control) {
      case 'blitz': return 180;
      case 'rapid': return 600;
      case 'classic': return 900;
      default: return 600;
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (diff: string): string => {
    switch (diff) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      case 'master': return 'Мастер';
      default: return diff;
    }
  };

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
        <div className="flex gap-6 items-center">
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

            <div className="inline-block rounded-sm overflow-hidden shadow-2xl relative" style={{ 
              boxShadow: '0 0 0 4px #3e2723, 0 0 0 6px #5d4037, 0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <div className="grid grid-cols-8 gap-0" style={{ width: '560px', height: '560px' }}>
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
                          width: '70px', 
                          height: '70px',
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
                            className="absolute top-1 left-1.5 text-xs font-semibold pointer-events-none"
                            style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
                          >
                            {rankLabel}
                          </span>
                        )}
                        {rowIndex === 7 && (
                          <span 
                            className="absolute bottom-1 right-1.5 text-xs font-semibold pointer-events-none"
                            style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
                          >
                            {fileLabel}
                          </span>
                        )}
                        {piece && (
                          <div 
                            className="text-6xl font-bold"
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
