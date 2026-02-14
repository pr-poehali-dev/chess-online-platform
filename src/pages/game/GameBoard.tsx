import { useState, useEffect, useRef } from 'react';
import { Board, Position, pieceImages, pieceSymbols, BoardTheme, boardThemes } from './gameTypes';

interface GameBoardProps {
  board: Board;
  onSquareClick: (row: number, col: number) => void;
  isSquareSelected: (row: number, col: number) => boolean;
  isSquarePossibleMove: (row: number, col: number) => boolean;
  kingInCheckPosition?: Position | null;
  showPossibleMoves?: boolean;
  flipped?: boolean;
  boardTheme?: BoardTheme;
  lastMove?: { from: Position; to: Position } | null;
}

export const GameBoard = ({ board, onSquareClick, isSquareSelected, isSquarePossibleMove, kingInCheckPosition, showPossibleMoves = true, flipped = false, boardTheme = 'wood', lastMove }: GameBoardProps) => {
  const config = boardThemes[boardTheme];
  const useImages = boardTheme !== 'classic';

  const [animatingMove, setAnimatingMove] = useState<{
    piece: { type: string; color: string };
    from: Position;
    to: Position;
    progress: 'sliding' | 'done';
  } | null>(null);

  const prevLastMoveRef = useRef<{ from: Position; to: Position } | null>(null);

  useEffect(() => {
    if (!lastMove) return;
    if (
      prevLastMoveRef.current &&
      prevLastMoveRef.current.from.row === lastMove.from.row &&
      prevLastMoveRef.current.from.col === lastMove.from.col &&
      prevLastMoveRef.current.to.row === lastMove.to.row &&
      prevLastMoveRef.current.to.col === lastMove.to.col
    ) return;

    prevLastMoveRef.current = lastMove;

    const piece = board[lastMove.to.row]?.[lastMove.to.col];
    if (!piece) return;

    setAnimatingMove({ piece, from: lastMove.from, to: lastMove.to, progress: 'sliding' });

    const timer = setTimeout(() => {
      setAnimatingMove(null);
    }, 500);

    return () => clearTimeout(timer);
  }, [lastMove, board]);

  const toViewPos = (pos: Position) => ({
    row: flipped ? 7 - pos.row : pos.row,
    col: flipped ? 7 - pos.col : pos.col,
  });

  const isHiddenByAnimation = (rowIndex: number, colIndex: number) => {
    if (!animatingMove || animatingMove.progress !== 'sliding') return false;
    return rowIndex === animatingMove.to.row && colIndex === animatingMove.to.col;
  };

  const renderOverlayPiece = () => {
    if (!animatingMove || animatingMove.progress !== 'sliding') return null;

    const fromView = toViewPos(animatingMove.from);
    const toView = toViewPos(animatingMove.to);
    const p = animatingMove.piece;

    const overlayStyle: React.CSSProperties = {
      position: 'absolute',
      width: '12.5%',
      height: '12.5%',
      left: `${fromView.col * 12.5}%`,
      top: `${fromView.row * 12.5}%`,
      zIndex: 50,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pieceOverlaySlide 0.5s ease-out forwards',
      '--target-left': `${toView.col * 12.5}%`,
      '--target-top': `${toView.row * 12.5}%`,
      '--start-left': `${fromView.col * 12.5}%`,
      '--start-top': `${fromView.row * 12.5}%`,
    } as React.CSSProperties;

    if (useImages) {
      return (
        <div style={overlayStyle}>
          <img
            src={pieceImages[p.color][p.type]}
            alt=""
            className="w-[80%] h-[80%] pointer-events-none"
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
            draggable={false}
          />
        </div>
      );
    }

    return (
      <div style={overlayStyle}>
        <div
          className="text-3xl md:text-5xl lg:text-6xl"
          style={{
            filter: p.color === 'white'
              ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.6)) drop-shadow(0 0 1px rgba(0,0,0,0.4))'
              : 'drop-shadow(0 2px 3px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(255,255,255,0.2))',
            color: p.color === 'white' ? '#f5f5f5' : '#1a1a1a',
            WebkitTextStroke: p.color === 'white' ? '1px #d0d0d0' : '1px #000000',
            textShadow: p.color === 'white'
              ? '0 1px 0 #ffffff, 0 -1px 0 #c0c0c0'
              : '0 1px 0 #000000, 0 -1px 0 #333333',
          }}
        >
          {pieceSymbols[p.color][p.type]}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes pieceOverlaySlide {
          from {
            left: var(--start-left);
            top: var(--start-top);
          }
          to {
            left: var(--target-left);
            top: var(--target-top);
          }
        }
      `}</style>
      <div className="inline-block rounded-sm overflow-hidden shadow-2xl relative w-full md:w-auto md:h-[min(calc(100vh-310px),700px)]" style={{ 
        boxShadow: `0 0 0 3px ${config.borderColor}, 0 0 0 5px ${config.borderOuterColor}, 0 15px 30px rgba(0,0,0,0.4)`,
        aspectRatio: '1/1',
        ...(config.backgroundImage ? {
          backgroundImage: `url(${config.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {})
      }}>
        {renderOverlayPiece()}
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
              const isLastMoveSquare = lastMove && ((lastMove.from.row === rowIndex && lastMove.from.col === colIndex) || (lastMove.to.row === rowIndex && lastMove.to.col === colIndex));
              const isKingInCheck = kingInCheckPosition?.row === rowIndex && kingInCheckPosition?.col === colIndex;
              const hasPiece = !!piece;
              const fileLabel = String.fromCharCode(97 + colIndex);
              const rankLabel = (8 - rowIndex).toString();
              const hidden = isHiddenByAnimation(rowIndex, colIndex);
              
              return (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onSquareClick(rowIndex, colIndex)}
                  className={`
                    relative cursor-pointer select-none p-0 m-0
                    ${isSelected ? 'ring-2 md:ring-4 ring-inset ring-yellow-400 z-10' : ''}
                    ${isKingInCheck ? 'ring-4 md:ring-[6px] ring-inset ring-red-500 z-20 animate-pulse' : ''}
                    hover:brightness-110
                  `}
                  style={{ 
                    width: '12.5%',
                    height: 0,
                    paddingBottom: '12.5%',
                    backgroundColor: isLastMoveSquare
                      ? (boardTheme === 'classic'
                        ? (isLight ? 'rgba(170, 140, 60, 0.55)' : 'rgba(140, 110, 40, 0.6)')
                        : boardTheme === 'flat'
                        ? (isLight ? '#c9a84e' : '#a08230')
                        : (isLight ? '#d4b86a' : '#a89050'))
                      : (isLight ? config.lightSquare : config.darkSquare),
                    ...(boardTheme === 'classic' ? {
                      boxShadow: isLight 
                        ? 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.05)'
                        : 'inset 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.1)'
                    } : {})
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                  {viewCol === 0 && (
                    <span 
                      className="absolute top-0.5 md:top-1 left-1 md:left-1.5 text-[8px] md:text-xs font-semibold pointer-events-none"
                      style={{ color: isLight ? config.labelLightColor : config.labelDarkColor }}
                    >
                      {rankLabel}
                    </span>
                  )}
                  {viewRow === 7 && (
                    <span 
                      className="absolute bottom-0.5 md:bottom-1 right-1 md:right-1.5 text-[8px] md:text-xs font-semibold pointer-events-none"
                      style={{ color: isLight ? config.labelLightColor : config.labelDarkColor }}
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
                  {piece && !hidden && useImages && (
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
                  {piece && !hidden && !useImages && (
                    <div 
                      className="text-3xl md:text-5xl lg:text-6xl relative z-20"
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
                </td>
              );
            })}
            </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GameBoard;