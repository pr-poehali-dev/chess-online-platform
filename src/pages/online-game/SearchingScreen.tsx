import { Button } from '@/components/ui/button';

interface SearchingScreenProps {
  opponentType: string | null;
  timeControl: string;
  searchTime: number;
  onCancel: () => void;
  getTimeLabel: (time: string | null) => string;
  getOpponentTypeLabel: (type: string | null) => string;
}

const SearchingScreen = ({
  timeControl,
  searchTime,
  onCancel,
  getTimeLabel,
}: SearchingScreenProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative w-28 h-28">
          {/* Внешнее кольцо */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" style={{ animationDuration: '1.4s' }} />
          {/* Среднее кольцо */}
          <div className="absolute inset-3 rounded-full border-2 border-amber-400/15 border-b-amber-400/60 animate-spin" style={{ animationDuration: '2.1s', animationDirection: 'reverse' }} />
          {/* Иконка ферзя по центру */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl select-none" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }}>♛</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-stone-100 mb-2">
          Ищем соперника
        </h2>
        <p className="text-stone-400 text-sm">
          Контроль времени: {getTimeLabel(timeControl)}
        </p>
      </div>

      <div className="flex justify-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-500"
            style={{
              animation: 'bounce 1.2s infinite',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <p className="text-xs text-stone-600">
        {searchTime} сек
      </p>

      <Button
        onClick={onCancel}
        variant="outline"
        className="border-stone-600 text-stone-300 hover:bg-stone-800"
      >
        Отменить поиск
      </Button>
    </div>
  );
};

export default SearchingScreen;
