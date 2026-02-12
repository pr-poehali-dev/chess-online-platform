import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface HomeSectionProps {
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
}

export const HomeSection = ({ 
  isAuthenticated, 
  setShowGameSettings, 
  setShowAuthModal
}: HomeSectionProps) => {
  const topRussia = [
    { rank: 1, name: 'Александр Петров', rating: 2456, city: 'Москва' },
    { rank: 2, name: 'Мария Смирнова', rating: 2398, city: 'Санкт-Петербург' },
    { rank: 3, name: 'Дмитрий Иванов', rating: 2356, city: 'Казань' },
    { rank: 4, name: 'Елена Козлова', rating: 2287, city: 'Екатеринбург' },
  ];

  const topRegion = [
    { rank: 1, name: 'Игорь Соколов', rating: 2123, city: 'Москва' },
    { rank: 2, name: 'Анна Волкова', rating: 2089, city: 'Подольск' },
    { rank: 3, name: 'Сергей Новиков', rating: 2045, city: 'Люберцы' },
    { rank: 4, name: 'Ольга Морозова', rating: 1998, city: 'Химки' },
  ];

  const topCity = [
    { rank: 1, name: 'Павел Лебедев', rating: 1923, city: 'Москва' },
    { rank: 2, name: 'Наталья Орлова', rating: 1889, city: 'Москва' },
    { rank: 3, name: 'Артём Федоров', rating: 1856, city: 'Москва' },
    { rank: 4, name: 'Вы', rating: 1842, city: 'Москва', highlight: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center pt-2 pb-12">
        <div className="flex justify-center mb-8 animate-slide-up">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-0 px-12 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
            onClick={() => {
              if (isAuthenticated) {
                setShowGameSettings(true);
              } else {
                setShowAuthModal(true);
              }
            }}
          >
            <Icon name="Play" className="mr-2" size={24} />
            Играть онлайн
          </Button>
        </div>
        <h2 className="text-5xl font-bold mb-4 text-slate-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-500 dark:to-orange-500 dark:bg-clip-text dark:text-transparent animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Играйте в шахматы онлайн
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Соревнуйтесь с игроками со всего мира или бросьте вызов компьютеру
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Icon name="Globe" className="text-blue-600 dark:text-blue-400" size={20} />
              Топ-4 России
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRussia.map((player) => (
                <div 
                  key={player.rank}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold text-sm">
                    {player.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{player.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{player.city}</div>
                  </div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{player.rating}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Icon name="Map" className="text-purple-600 dark:text-purple-400" size={20} />
              Топ-4 региона
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRegion.map((player) => (
                <div 
                  key={player.rank}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 text-white font-bold text-sm">
                    {player.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{player.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{player.city}</div>
                  </div>
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{player.rating}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Icon name="Home" className="text-orange-600 dark:text-orange-400" size={20} />
              Топ-4 города
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCity.map((player) => (
                <div 
                  key={player.rank}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    player.highlight 
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-500/30' 
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    player.highlight 
                      ? 'bg-orange-600 dark:bg-orange-500 text-white' 
                      : 'bg-orange-600 dark:bg-orange-500 text-white'
                  }`}>
                    {player.rank}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${
                      player.highlight 
                        ? 'text-orange-900 dark:text-orange-300' 
                        : 'text-gray-900 dark:text-white'
                    }`}>{player.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{player.city}</div>
                  </div>
                  <div className={`text-sm font-bold ${
                    player.highlight 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>{player.rating}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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

interface LeaderboardSectionProps {
  leaderboard: Array<{
    rank: number;
    name: string;
    rating: number;
    avatar: string;
    highlight?: boolean;
  }>;
}

export const LeaderboardSection = ({ leaderboard }: LeaderboardSectionProps) => {
  return (
    <div className="animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="Crown" className="text-yellow-500" size={24} />
            Таблица лидеров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-800/50">
              <TabsTrigger value="global">Общий рейтинг</TabsTrigger>
              <TabsTrigger value="week">За неделю</TabsTrigger>
              <TabsTrigger value="month">За месяц</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="space-y-3 mt-6">
              {leaderboard.map((player) => (
                <div 
                  key={player.rank}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    player.highlight 
                      ? 'bg-slate-100 dark:bg-blue-500/20 border-2 border-slate-300 dark:border-blue-400/50' 
                      : 'bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold w-8 ${
                      player.rank === 1 ? 'text-yellow-400' :
                      player.rank === 2 ? 'text-gray-300' :
                      player.rank === 3 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      #{player.rank}
                    </div>
                    <div className="text-3xl">{player.avatar}</div>
                    <div>
                      <div className={`font-semibold ${player.highlight ? 'text-slate-900 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Рейтинг: {player.rating}</div>
                    </div>
                  </div>
                  {player.rank <= 3 && (
                    <Badge variant="outline" className={`
                      ${player.rank === 1 ? 'border-yellow-400/50 text-yellow-400' : ''}
                      ${player.rank === 2 ? 'border-gray-300/50 text-gray-300' : ''}
                      ${player.rank === 3 ? 'border-orange-400/50 text-orange-400' : ''}
                    `}>
                      <Icon name="Trophy" className="mr-1" size={14} />
                      ТОП-{player.rank}
                    </Badge>
                  )}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="week" className="mt-6">
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="TrendingUp" className="mx-auto mb-4" size={48} />
                <p>Недельная статистика обновляется каждый понедельник</p>
              </div>
            </TabsContent>
            <TabsContent value="month" className="mt-6">
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="Calendar" className="mx-auto mb-4" size={48} />
                <p>Месячная статистика обновляется 1 числа каждого месяца</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface TournamentsSectionProps {
  upcomingTournaments: Array<{
    id: number;
    name: string;
    date: string;
    prize: string;
    participants: number;
    format: string;
  }>;
}

export const TournamentsSection = ({ upcomingTournaments }: TournamentsSectionProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:bg-gradient-to-r dark:from-orange-400 dark:to-purple-500 dark:bg-clip-text dark:text-transparent">
          Предстоящие турниры
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Зарегистрируйтесь и соревнуйтесь за призовой фонд</p>
      </div>

      {upcomingTournaments.map((tournament, index) => (
        <Card 
          key={tournament.id} 
          className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all animate-scale-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-white">{tournament.name}</CardTitle>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                    <Icon name="Calendar" className="mr-1" size={14} />
                    {tournament.date}
                  </Badge>
                  <Badge variant="outline" className="border-green-400/50 text-green-400">
                    <Icon name="DollarSign" className="mr-1" size={14} />
                    {tournament.prize}
                  </Badge>
                  <Badge variant="outline" className="border-purple-400/50 text-purple-400">
                    <Icon name="Users" className="mr-1" size={14} />
                    {tournament.participants} участников
                  </Badge>
                </div>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Формат турнира</div>
                <div className="font-semibold text-gray-900 dark:text-white">{tournament.format}</div>
              </div>
              <Button className="gradient-primary border-0 text-white hover:opacity-90">
                <Icon name="UserPlus" className="mr-2" size={18} />
                Зарегистрироваться
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 border-dashed">
        <CardContent className="py-12 text-center">
          <Icon name="Trophy" className="mx-auto mb-4 text-slate-300 dark:text-gray-500" size={48} />
          <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-gray-300">Хотите создать свой турнир?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Организуйте собственный турнир и пригласите друзей</p>
          <Button variant="outline" className="border-slate-200 dark:border-white/20">
            <Icon name="Plus" className="mr-2" size={18} />
            Создать турнир
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};