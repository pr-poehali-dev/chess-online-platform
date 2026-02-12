import { useRef } from 'react';
import Icon from '@/components/ui/icon';

interface MoveHistoryProps {
  moveHistory: string[];
  currentMoveIndex: number;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUpOrLeave: () => void;
  onPreviousMove: () => void;
  onNextMove: () => void;
  historyRef: React.RefObject<HTMLDivElement>;
}

export const MoveHistory = ({
  moveHistory,
  currentMoveIndex,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUpOrLeave,
  onPreviousMove,
  onNextMove,
  historyRef
}: MoveHistoryProps) => {
  return (
    <div className="w-full max-w-[400px] md:max-w-[560px] flex items-center gap-2">
      <button
        onClick={onPreviousMove}
        disabled={currentMoveIndex === 0}
        className="p-2 bg-stone-800/50 hover:bg-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 flex-shrink-0"
        title="Предыдущий ход"
      >
        <Icon name="ChevronLeft" size={20} />
      </button>
      
      <div className="relative flex-1">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-900 to-transparent z-10 pointer-events-none"></div>
        <div 
          ref={historyRef} 
          className="overflow-x-auto hide-scrollbar bg-stone-800/50 backdrop-blur-sm rounded-lg border border-stone-700/30 p-1.5"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpOrLeave}
          onMouseLeave={onMouseUpOrLeave}
        >
          <div className={`flex gap-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} min-h-[20px]`}>
            {moveHistory.map((move, index) => (
              <div 
                key={index} 
                className={`whitespace-nowrap flex-shrink-0 transition-all ${
                  index === currentMoveIndex ? 'text-white font-semibold text-[12px]' : 'text-stone-300 text-[10px]'
                }`}
              >
                <span className="text-stone-500 mr-0.5">{Math.floor(index / 2) + 1}.</span>
                {move}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNextMove}
        disabled={currentMoveIndex === moveHistory.length - 1}
        className="p-2 bg-stone-800/50 hover:bg-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 flex-shrink-0"
        title="Следующий ход"
      >
        <Icon name="ChevronRight" size={20} />
      </button>
    </div>
  );
};