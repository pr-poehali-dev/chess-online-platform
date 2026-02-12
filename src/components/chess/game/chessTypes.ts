export type Piece = {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
};

export type Board = (Piece | null)[][];
export type Position = { row: number; col: number };

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
