export type Piece = {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
};

export type Board = (Piece | null)[][];
export type Position = { row: number; col: number };

export type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};

export const initialBoard: Board = [
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

export const pieceSymbols: Record<string, Record<string, string>> = {
  white: {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
  },
  black: {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
  }
};

export function parseTimeControl(control: string): { minutes: number; increment: number } {
  if (control.includes('+')) {
    const [mins, inc] = control.split('+').map(Number);
    return { minutes: mins || 10, increment: inc || 0 };
  }
  const mins = parseInt(control);
  if (!isNaN(mins)) return { minutes: mins, increment: 0 };
  switch (control) {
    case 'blitz': return { minutes: 3, increment: 2 };
    case 'rapid': return { minutes: 10, increment: 5 };
    case 'classic': return { minutes: 15, increment: 10 };
    default: return { minutes: 10, increment: 0 };
  }
}

export function getInitialTime(control: string): number {
  const { minutes } = parseTimeControl(control);
  return minutes * 60;
}

export function getIncrement(control: string): number {
  const { increment } = parseTimeControl(control);
  return increment;
}

export function formatTime(seconds: number): string {
  if (seconds <= 10) {
    return seconds.toFixed(1);
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getDifficultyLabel(diff: string): string {
  switch (diff) {
    case 'easy': return 'Легкий';
    case 'medium': return 'Средний';
    case 'hard': return 'Сложный';
    case 'master': return 'Мастер';
    default: return diff;
  }
}