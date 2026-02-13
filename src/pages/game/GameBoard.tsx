import { Board, Position, pieceImages } from './gameTypes';

interface GameBoardProps {
  board: Board;
  onSquareClick: (row: number, col: number) => void;
  isSquareSelected: (row: number, col: number) => boolean;
  isSquarePossibleMove: (row: number, col: number) => boolean;
  kingInCheckPosition?: Position | null;
  showPossibleMoves?: boolean;
  flipped?: boolean;
}

const LIGHT_SQUARE = '#b8976a';
const DARK_SQUARE = '#8b6b4a';

export const GameBoard = ({ board, onSquareClick, isSquareSelected, isSquarePossibleMove, kingInCheckPosition, showPossibleMoves = true, flipped = false }: GameBoardProps) => {
  return (
    <div className="inline-block rounded-sm overflow-hidden shadow-2xl relative w-full md:w-auto md:h-[min(calc(100vh-310px),700px)]" style={{ 
      boxShadow: '0 0 0 3px #5d4037, 0 0 0 5px #3e2723, 0 15px 30px rgba(0,0,0,0.4)',
      aspectRatio: '1/1'
    }}>
      <table className="w-full h-full border-collapse" style={{ borderSpacing: 0 }}>
        <tbody>
        {Array.from({ length: 8 }).map((_, viewRow) => {
          const rowIndex = flipped ? 7 - viewRow : viewRow;
          return (
          <tr key={`row-${rowIndex}`}>
          {Array.from({ length: 8 }).map((_, viewCol) => {
            const colIndex = flipped ? 7 - viewCol : viewCol;
            const piece = board[rowIndex]?.[colIndex] || null;
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = isSquareSelected(rowIndex, colIndex);
            const isPossible = showPossibleMoves && isSquarePossibleMove(rowIndex, colIndex);
            const isKingInCheck = kingInCheckPosition?.row === rowIndex && kingInCheckPosition?.col === colIndex;
            const hasPiece = !!piece;
            const fileLabel = String.fromCharCode(97 + colIndex);
            const rankLabel = (8 - rowIndex).toString();
            
            return (
              <td
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onSquareClick(rowIndex, colIndex)}
                className={`
                  relative cursor-pointer select-none p-0 m-0
                  ${isSelected ? 'ring-2 md:ring-4 ring-inset ring-yellow-400 z-10' : ''}
                  ${isKingInCheck ? 'ring-4 md:ring-[6px] ring-inset ring-red-500 z-20 animate-pulse' : ''}
                  hover:brightness-110 transition-all
                `}
                style={{ 
                  width: '12.5%',
                  height: 0,
                  paddingBottom: '12.5%',
                  backgroundColor: isLight ? LIGHT_SQUARE : DARK_SQUARE
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                {viewCol === 0 && (
                  <span 
                    className="absolute top-0.5 md:top-1 left-1 md:left-1.5 text-[8px] md:text-xs font-semibold pointer-events-none"
                    style={{ color: isLight ? DARK_SQUARE : LIGHT_SQUARE }}
                  >
                    {rankLabel}
                  </span>
                )}
                {viewRow === 7 && (
                  <span 
                    className="absolute bottom-0.5 md:bottom-1 right-1 md:right-1.5 text-[8px] md:text-xs font-semibold pointer-events-none"
                    style={{ color: isLight ? DARK_SQUARE : LIGHT_SQUARE }}
                  >
                    {fileLabel}
                  </span>
                )}
                {isPossible && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                  >
                    {hasPiece ? (
                      <div className="w-full h-full rounded-full border-4 border-green-400/70 animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-400/70" />
                    )}
                  </div>
                )}
                {piece && (
                  <img
                    src={pieceImages[piece.color][piece.type]}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-[80%] h-[80%] relative z-20 pointer-events-none"
                    style={{
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
                    }}
                    draggable={false}
                  />
                )}
                </div>
              </td>
            );
          })}
          </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};
