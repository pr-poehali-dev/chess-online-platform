import { Board, Piece, Position } from './gameTypes';

export const isValidMove = (board: Board, from: Position, to: Position, piece: Piece): boolean => {
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
      return !isPathBlocked(board, from, to);
    case 'rook':
      if (dx !== 0 && dy !== 0) return false;
      return !isPathBlocked(board, from, to);
    case 'queen':
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;
      return !isPathBlocked(board, from, to);
    case 'king':
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    default:
      return false;
  }
};

export const isPathBlocked = (board: Board, from: Position, to: Position): boolean => {
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

export const getPossibleMoves = (board: Board, pos: Position): Position[] => {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const moves: Position[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, pos, { row, col }, piece)) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
};

export const evaluatePosition = (testBoard: Board, color: 'white' | 'black'): number => {
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

export const getAllPossibleMovesForBoard = (testBoard: Board, color: 'white' | 'black'): { from: Position; to: Position }[] => {
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

export const isValidMoveForBoard = (testBoard: Board, from: Position, to: Position, piece: Piece): boolean => {
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

export const isPathBlockedForBoard = (testBoard: Board, from: Position, to: Position): boolean => {
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

export const getBestMove = (board: Board, moves: { from: Position; to: Position }[], isDifficult: boolean): { from: Position; to: Position } => {
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
