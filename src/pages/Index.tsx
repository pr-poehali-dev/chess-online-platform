import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('play');
  const [searchingGame, setSearchingGame] = useState(false);

  const stats = {
    rating: 1842,
    online: 2847
  };

  const onlinePlayers = [
    { name: 'Александр П.', rating: 1856, country: '🇷🇺', status: 'online' },
    { name: 'Maria S.', rating: 1798, country: '🇺🇦', status: 'playing' },
    { name: 'Дмитрий И.', rating: 1923, country: '🇷🇺', status: 'online' },
    { name: 'Elena K.', rating: 1767, country: '🇰🇿', status: 'online' },
    { name: 'Sergey V.', rating: 1889, country: '🇧🇾', status: 'playing' },
    { name: 'Anna M.', rating: 1834, country: '🇷🇺', status: 'online' },
  ];

  const activeGames = [
    { player1: 'Иван С.', player2: 'Петр Д.', rating1: 1945, rating2: 1889, moves: 23, format: 'Блиц 3+2', viewers: 12 },
    { player1: 'Мария Н.', player2: 'Ольга К.', rating1: 2104, rating2: 2089, moves: 15, format: 'Рапид 10+5', viewers: 34 },
    { player1: 'Андрей Л.', player2: 'Дмитрий С.', rating1: 1756, rating2: 1823, moves: 8, format: 'Блиц 3+2', viewers: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-white/10 glass-effect sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">♟️</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                ChessMaster
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveSection('play')}
                className={`transition-all font-medium ${activeSection === 'play' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Играть
              </button>
              <button 
                onClick={() => setActiveSection('watch')}
                className={`transition-all font-medium ${activeSection === 'watch' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Смотреть игры
              </button>
              <button 
                onClick={() => setActiveSection('profile')}
                className={`transition-all font-medium ${activeSection === 'profile' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Профиль
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">{stats.online} онлайн</span>
              </div>
              <Avatar className="ring-2 ring-blue-400/50">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-primary text-white font-bold">ВЫ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'play' && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                Найди соперника и играй!
              </h2>
              <p className="text-xl text-gray-400">
                {stats.online} игроков онлайн ждут вызова
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-effect border-white/10 animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="Swords" className="text-orange-500" size={28} />
                      Быстрый поиск игры
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="blitz" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 h-12">
                        <TabsTrigger value="blitz" className="data-[state=active]:bg-orange-500/20">
                          <Icon name="Zap" className="mr-2" size={18} />
                          Блиц 3+2
                        </TabsTrigger>
                        <TabsTrigger value="rapid" className="data-[state=active]:bg-blue-500/20">
                          <Icon name="Clock" className="mr-2" size={18} />
                          Рапид 10+5
                        </TabsTrigger>
                        <TabsTrigger value="classic" className="data-[state=active]:bg-purple-500/20">
                          <Icon name="Timer" className="mr-2" size={18} />
                          Классика 15+10
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="blitz" className="mt-6">
                        <div className="space-y-4">
                          <div className="p-6 rounded-lg bg-slate-800/30 border border-white/5 text-center">
                            <div className="text-6xl mb-4">⚡</div>
                            <h3 className="text-xl font-semibold mb-2">Молниеносная игра</h3>
                            <p className="text-gray-400 mb-6">3 минуты + 2 секунды на ход</p>
                            {!searchingGame ? (
                              <Button 
                                size="lg" 
                                className="gradient-primary border-0 text-white hover:opacity-90 transition-all hover:scale-105 w-full max-w-md"
                                onClick={() => setSearchingGame(true)}
                              >
                                <Icon name="Search" className="mr-2" size={20} />
                                Найти соперника
                              </Button>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                                  <span className="text-blue-400 font-medium">Ищем соперника...</span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => setSearchingGame(false)}
                                >
                                  Отменить поиск
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="p-3 rounded-lg bg-slate-800/20 border border-white/5 text-center">
                              <div className="text-2xl mb-1">⚔️</div>
                              <div className="text-gray-400">Динамика</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/20 border border-white/5 text-center">
                              <div className="text-2xl mb-1">🎯</div>
                              <div className="text-gray-400">Точность</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/20 border border-white/5 text-center">
                              <div className="text-2xl mb-1">🔥</div>
                              <div className="text-gray-400">Азарт</div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="rapid" className="mt-6">
                        <div className="p-6 rounded-lg bg-slate-800/30 border border-white/5 text-center">
                          <div className="text-6xl mb-4">🎯</div>
                          <h3 className="text-xl font-semibold mb-2">Умеренный темп</h3>
                          <p className="text-gray-400 mb-6">10 минут + 5 секунд на ход</p>
                          <Button 
                            size="lg" 
                            className="gradient-primary border-0 text-white hover:opacity-90 transition-all hover:scale-105 w-full max-w-md"
                          >
                            <Icon name="Search" className="mr-2" size={20} />
                            Найти соперника
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="classic" className="mt-6">
                        <div className="p-6 rounded-lg bg-slate-800/30 border border-white/5 text-center">
                          <div className="text-6xl mb-4">👑</div>
                          <h3 className="text-xl font-semibold mb-2">Классическая партия</h3>
                          <p className="text-gray-400 mb-6">15 минут + 10 секунд на ход</p>
                          <Button 
                            size="lg" 
                            className="gradient-primary border-0 text-white hover:opacity-90 transition-all hover:scale-105 w-full max-w-md"
                          >
                            <Icon name="Search" className="mr-2" size={20} />
                            Найти соперника
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="UserPlus" className="text-purple-500" size={24} />
                      Или пригласи друга
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Введите имя пользователя"
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <Button className="gradient-secondary border-0 text-white px-6">
                        <Icon name="Send" className="mr-2" size={18} />
                        Отправить вызов
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-effect border-white/10 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="Users" className="text-green-400" size={24} />
                        Игроки онлайн
                      </div>
                      <Badge variant="outline" className="border-green-400/50 text-green-400">
                        {onlinePlayers.filter(p => p.status === 'online').length} доступно
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {onlinePlayers.map((player, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-slate-700 text-sm">
                                {player.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {player.country} {player.name}
                              </div>
                              <div className="text-xs text-gray-400">Рейтинг: {player.rating}</div>
                            </div>
                          </div>
                          {player.status === 'online' ? (
                            <Button size="sm" variant="outline" className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10">
                              <Icon name="Swords" size={14} />
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-0">
                              Играет
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16 ring-2 ring-blue-400/50">
                        <AvatarFallback className="text-xl gradient-primary text-white font-bold">ВЫ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">Ваш рейтинг</div>
                        <div className="text-3xl font-bold text-blue-400">{stats.rating}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'watch' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Идут партии
              </h2>
              <p className="text-xl text-gray-400">Смотрите и учитесь у лучших игроков</p>
            </div>

            <div className="space-y-4">
              {activeGames.map((game, index) => (
                <Card 
                  key={index}
                  className="glass-effect border-white/10 hover:border-white/20 transition-all cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-600">
                              {game.player1.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{game.player1}</div>
                            <div className="text-sm text-gray-400">{game.rating1}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <Badge variant="outline" className="border-orange-400/50 text-orange-400">
                            {game.format}
                          </Badge>
                          <div className="text-2xl font-bold">VS</div>
                          <div className="text-sm text-gray-400">Ход {game.moves}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold">{game.player2}</div>
                            <div className="text-sm text-gray-400">{game.rating2}</div>
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-purple-600">
                              {game.player2.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-6">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Icon name="Eye" size={18} />
                          <span className="text-sm">{game.viewers}</span>
                        </div>
                        <Button className="gradient-primary border-0 text-white">
                          <Icon name="Play" className="mr-2" size={18} />
                          Смотреть
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" className="border-white/20">
                <Icon name="RefreshCw" className="mr-2" size={18} />
                Загрузить ещё
              </Button>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-400/50">
                    <AvatarFallback className="text-3xl gradient-primary text-white font-bold">ВЫ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">Ваш профиль</h2>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                        <Icon name="TrendingUp" className="mr-1" size={14} />
                        Рейтинг: {stats.rating}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="text-4xl font-bold text-blue-400">247</div>
                    <div className="text-sm text-gray-400 mt-2">Всего партий</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="text-4xl font-bold text-green-400">156</div>
                    <div className="text-sm text-gray-400 mt-2">Побед</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="text-4xl font-bold text-orange-400">63%</div>
                    <div className="text-sm text-gray-400 mt-2">Винрейт</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
