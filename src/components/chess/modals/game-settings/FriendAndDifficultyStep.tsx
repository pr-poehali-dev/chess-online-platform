import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Friend {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  city: string;
}

interface FriendAndDifficultyStepProps {
  selectedOpponent: 'city' | 'region' | 'country' | 'friend' | 'computer' | null;
  friends: Friend[];
  onFriendSelect: (friendId: string) => void;
  onDifficultySelect: (difficulty: 'easy' | 'medium' | 'hard' | 'master') => void;
}

const difficulties = [
  { key: 'easy' as const, emoji: '🟢', label: 'Легкий', desc: 'Рейтинг: 800-1000 • Для начинающих' },
  { key: 'medium' as const, emoji: '🟡', label: 'Средний', desc: 'Рейтинг: 1200-1500 • Любители' },
  { key: 'hard' as const, emoji: '🟠', label: 'Сложный', desc: 'Рейтинг: 1800-2000 • Опытные' },
  { key: 'master' as const, emoji: '🔴', label: 'Мастер', desc: 'Рейтинг: 2200+ • Для профессионалов' },
];

const FriendAndDifficultyStep = ({
  selectedOpponent,
  friends,
  onFriendSelect,
  onDifficultySelect,
}: FriendAndDifficultyStepProps) => {
  if (selectedOpponent === 'friend') {
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Выберите друга для игры
        </div>
        {friends.map((friend) => (
          <Button
            key={friend.id}
            className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
            onClick={() => onFriendSelect(friend.id)}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{friend.avatar}</div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{friend.name}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">
                  {friend.city} • Рейтинг: {friend.rating}
                </div>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-slate-400" />
          </Button>
        ))}
      </div>
    );
  }

  if (selectedOpponent === 'computer') {
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Выберите уровень сложности
        </div>
        {difficulties.map((d) => (
          <Button
            key={d.key}
            className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
            onClick={() => onDifficultySelect(d.key)}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{d.emoji}</div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{d.label}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">{d.desc}</div>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-slate-400" />
          </Button>
        ))}
      </div>
    );
  }

  return null;
};

export default FriendAndDifficultyStep;
