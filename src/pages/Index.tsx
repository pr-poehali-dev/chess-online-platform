import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === null;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const stats = {
    games: 247,
    wins: 156,
    rating: 1842,
    tournaments: 12
  };

  const leaderboard = [
    { rank: 1, name: 'Александр Петров', rating: 2456, avatar: '🏆' },
    { rank: 2, name: 'Мария Смирнова', rating: 2398, avatar: '👑' },
    { rank: 3, name: 'Дмитрий Иванов', rating: 2356, avatar: '⭐' },
    { rank: 4, name: 'Елена Козлова', rating: 2287, avatar: '💎' },
    { rank: 5, name: 'Вы', rating: 1842, avatar: '🎯', highlight: true },
  ];

  const upcomingTournaments = [
    { 
      id: 1, 
      name: 'Чемпионат Быстрых Партий', 
      date: '15 Февраля 2026', 
      prize: '50 000 ₽',
      participants: 64,
      format: 'Блиц 3+2'
    },
    { 
      id: 2, 
      name: 'Кубок Гроссмейстеров', 
      date: '22 Февраля 2026', 
      prize: '100 000 ₽',
      participants: 32,
      format: 'Классика 15+10'
    },
    { 
      id: 3, 
      name: 'Весенний Марафон', 
      date: '1 Марта 2026', 
      prize: '30 000 ₽',
      participants: 128,
      format: 'Рапид 10+5'
    },
  ];

  const recentGames = [
    { opponent: 'Иван Сидоров', result: 'win', rating: 1789, moves: 42, time: '2 часа назад' },
    { opponent: 'Ольга Новикова', result: 'loss', rating: 1923, moves: 35, time: '5 часов назад' },
    { opponent: 'Сергей Волков', result: 'win', rating: 1756, moves: 38, time: 'Вчера' },
  ];

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:bg-gradient-to-br transition-colors duration-300">
      <nav className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">♟️</div>
              <h1 className="text-2xl font-bold text-slate-900 dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-500 dark:bg-clip-text dark:text-transparent">
                ЛигаШахмат
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveSection('home')}
                className={`transition-all ${activeSection === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Главная
              </button>
              <button 
                onClick={() => setActiveSection('profile')}
                className={`transition-all ${activeSection === 'profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Профиль
              </button>
              <button 
                onClick={() => setActiveSection('leaderboard')}
                className={`transition-all ${activeSection === 'leaderboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Рейтинг
              </button>
              <button 
                onClick={() => setActiveSection('tournaments')}
                className={`transition-all ${activeSection === 'tournaments' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Турниры
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {isDarkMode ? (
                  <Icon name="Moon" size={20} className="text-blue-400" />
                ) : (
                  <Icon name="Sun" size={20} className="text-yellow-500" />
                )}
              </Button>
              <Avatar className="ring-2 ring-blue-400/50">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-primary text-white">ВЫ</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="font-semibold text-gray-900 dark:text-white">Ваш профиль</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Рейтинг: {stats.rating}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-12">
              <h2 className="text-5xl font-bold mb-4 text-slate-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-500 dark:to-orange-500 dark:bg-clip-text dark:text-transparent animate-slide-up">
                Играйте в шахматы онлайн
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Соревнуйтесь с игроками со всего мира или бросьте вызов компьютеру
              </p>
              <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button size="lg" className="gradient-primary border-0 text-white hover:opacity-90 transition-all hover:scale-105">
                  <Icon name="Users" className="mr-2" size={20} />
                  Играть с соперником
                </Button>
                <Button size="lg" variant="outline" className="border-purple-500/50 hover:bg-purple-500/10">
                  <Icon name="Cpu" className="mr-2" size={20} />
                  Играть с компьютером
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Icon name="Zap" className="text-orange-500" size={24} />
                    Быстрая игра
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button className="h-20 flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10">
                      <Icon name="Zap" size={20} className="text-slate-700 dark:text-white" />
                      <span className="text-xs text-slate-900 dark:text-white">Блиц</span>
                      <span className="text-xs text-slate-500 dark:text-gray-400">3+2</span>
                    </Button>
                    <Button className="h-20 flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10">
                      <Icon name="Clock" size={20} className="text-slate-700 dark:text-white" />
                      <span className="text-xs text-slate-900 dark:text-white">Рапид</span>
                      <span className="text-xs text-slate-500 dark:text-gray-400">10+5</span>
                    </Button>
                    <Button className="h-20 flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10">
                      <Icon name="Timer" size={20} className="text-slate-700 dark:text-white" />
                      <span className="text-xs text-slate-900 dark:text-white">Классика</span>
                      <span className="text-xs text-slate-500 dark:text-gray-400">15+10</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Выберите формат и начните играть прямо сейчас</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Icon name="Bot" className="text-purple-500" size={24} />
                    Игра с компьютером
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Уровень сложности</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">Средний</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10">Новичок</Button>
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10">Средний</Button>
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10">Эксперт</Button>
                  </div>
                  <Button className="w-full gradient-secondary border-0 text-white">
                    Начать игру с ИИ
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Icon name="History" className="text-blue-600 dark:text-blue-400" size={24} />
                  Последние партии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGames.map((game, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer border border-slate-200 dark:border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-white">
                            {game.opponent.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{game.opponent}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Рейтинг: {game.rating}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{game.moves} ходов</div>
                        <Badge variant={game.result === 'win' ? 'default' : 'destructive'} className={game.result === 'win' ? 'bg-green-600' : ''}>
                          {game.result === 'win' ? 'Победа' : 'Поражение'}
                        </Badge>
                        <div className="text-sm text-gray-500 dark:text-gray-500">{game.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'profile' && (
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
        )}

        {activeSection === 'leaderboard' && (
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
        )}

        {activeSection === 'tournaments' && (
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
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-white/10 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2026 ЛигаШахмат. Все права защищены.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">О нас</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Правила</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Поддержка</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Контакты</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;