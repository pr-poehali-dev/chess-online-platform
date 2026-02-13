import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface SearchingScreenProps {
  opponentType: string | null;
  timeControl: string;
  searchTime: number;
  isAnyRating: boolean;
  onCancel: () => void;
  getTimeLabel: (time: string | null) => string;
  getOpponentTypeLabel: (type: string | null) => string;
}

const SearchingScreen = ({
  opponentType,
  timeControl,
  searchTime,
  isAnyRating,
  onCancel,
  getTimeLabel,
  getOpponentTypeLabel
}: SearchingScreenProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Search" size={32} className="text-amber-400" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-stone-100 mb-2">
          {isAnyRating ? 'Ищем соперника' : 'Поиск соперника'}
        </h2>
        {isAnyRating ? (
          <p className="text-stone-400">Любой рейтинг</p>
        ) : (
          <p className="text-stone-400">
            Ищем игрока {getOpponentTypeLabel(opponentType)}
          </p>
        )}
        <p className="text-sm text-stone-500 mt-2">
          Контроль времени: {getTimeLabel(timeControl)}
        </p>
        {!isAnyRating && (
          <p className="text-xs text-stone-600 mt-2">
            Поиск: {searchTime} сек
          </p>
        )}
      </div>

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
