import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProfileSectionProps {
  stats: {
    games: number;
    wins: number;
    rating: number;
    tournaments: number;
  };
}

export const ProfileSection = ({ stats }: ProfileSectionProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-blue-400/50">
              <AvatarFallback className="text-3xl gradient-primary text-white">ВЫ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Ваш профиль</h2>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                  <Icon name="TrendingUp" className="mr-1" size={14} />
                  Рейтинг: {stats.rating}
                </Badge>
                <Badge variant="outline" className="border-purple-400/50 text-purple-400">
                  <Icon name="Trophy" className="mr-1" size={14} />
                  {stats.tournaments} турниров
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.games}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Всего партий</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.wins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Побед</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Math.round(stats.wins / stats.games * 100)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Винрейт</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.rating}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Рейтинг</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="Award" className="text-slate-700 dark:text-yellow-500" size={24} />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-semibold text-gray-900 dark:text-white">100 побед</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Разблокировано</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <div className="text-4xl mb-2">⚡</div>
              <div className="font-semibold text-gray-900 dark:text-white">Блиц-мастер</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Разблокировано</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-200 dark:bg-slate-800/30 border border-slate-300 dark:border-white/10 opacity-50">
              <div className="text-4xl mb-2">👑</div>
              <div className="font-semibold text-gray-900 dark:text-white">Гроссмейстер</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Заблокировано</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
