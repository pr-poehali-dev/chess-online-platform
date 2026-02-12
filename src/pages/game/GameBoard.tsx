import { Board, Position, pieceSymbols } from './gameTypes';

interface GameBoardProps {
  board: Board;
  onSquareClick: (row: number, col: number) => void;
  isSquareSelected: (row: number, col: number) => boolean;
  isSquarePossibleMove: (row: number, col: number) => boolean;
}

export const GameBoard = ({ board, onSquareClick, isSquareSelected, isSquarePossibleMove }: GameBoardProps) => {
  return (
    <div className="inline-block rounded-sm overflow-hidden shadow-2xl relative w-full max-w-[400px] md:max-w-[560px]" style={{ 
      boxShadow: '0 0 0 3px #3e2723, 0 0 0 5px #5d4037, 0 15px 30px rgba(0,0,0,0.4)',
      aspectRatio: '1/1',
      backgroundImage: 'url(https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/79c4520d-63b3-4e07-8bba-0b7b41c53435.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="grid grid-cols-8 gap-0 w-full h-full">
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
                onClick={() => onSquareClick(rowIndex, colIndex)}
                className={`
                  relative flex items-center justify-center cursor-pointer select-none aspect-square
                  ${isSelected ? 'ring-2 md:ring-4 ring-inset ring-yellow-400 z-10' : ''}
                  ${isPossible ? 'ring-2 md:ring-4 ring-inset ring-green-400 z-10' : ''}
                  hover:brightness-110 transition-all
                `}
                style={{ 
                  backgroundColor: isLight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  boxShadow: isLight 
                    ? 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.05)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {colIndex === 0 && (
                  <span 
                    className="absolute top-0.5 md:top-1 left-1 md:left-1.5 text-[8px] md:text-xs font-semibold pointer-events-none"
                    style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
                  >
                    {rankLabel}
                  </span>
                )}
                {rowIndex === 7 && (
                  <span 
                    className="absolute bottom-0.5 md:bottom-1 right-1 md:right-1.5 text-[8px] md:text-xs font-semibold pointer-events-none"
                    style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
                  >
                    {fileLabel}
                  </span>
                )}
                {piece && (
                  <div 
                    className="text-3xl md:text-5xl lg:text-6xl"
                    style={{
                      filter: piece.color === 'white' 
                        ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.6)) drop-shadow(0 0 1px rgba(0,0,0,0.4))' 
                        : 'drop-shadow(0 2px 3px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(255,255,255,0.2))',
                      color: piece.color === 'white' ? '#f5f5f5' : '#1a1a1a',
                      WebkitTextStroke: piece.color === 'white' ? '1px #d0d0d0' : '1px #000000',
                      textShadow: piece.color === 'white' 
                        ? '0 1px 0 #ffffff, 0 -1px 0 #c0c0c0' 
                        : '0 1px 0 #000000, 0 -1px 0 #333333'
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
  );
};