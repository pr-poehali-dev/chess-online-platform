import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const OnlineGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opponentType = searchParams.get('opponent') as 'city' | 'region' | 'country' | null;
  const timeControl = searchParams.get('time') || '10+0';
  
  const [searchStatus, setSearchStatus] = useState<'searching' | 'found' | 'starting'>('searching');
  const [opponent, setOpponent] = useState<{
    name: string;
    rating: number;
    city: string;
    avatar: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(savedUser);
    const userCity = userData.city || 'Москва';

    const cityOpponents = [
      { name: 'Павел Лебедев', rating: 1923, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pavel' },
      { name: 'Наталья Орлова', rating: 1889, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia' },
      { name: 'Артём Федоров', rating: 1856, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Artem' },
      { name: 'Игорь Петров', rating: 1823, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IgorP' },
      { name: 'Марина Сидорова', rating: 1798, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marina' },
    ];

    const regionOpponents = [
      { name: 'Игорь Соколов', rating: 2123, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor' },
      { name: 'Анна Волкова', rating: 2089, city: 'Подольск', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
      { name: 'Сергей Новиков', rating: 2045, city: 'Люберцы', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey' },
      { name: 'Ольга Морозова', rating: 1998, city: 'Химки', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olga' },
    ];

    const countryOpponents = [
      { name: 'Александр Петров', rating: 2456, city: 'Москва', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander' },
      { name: 'Мария Смирнова', rating: 2398, city: 'Санкт-Петербург', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
      { name: 'Дмитрий Иванов', rating: 2356, city: 'Казань', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry' },
      { name: 'Елена Козлова', rating: 2287, city: 'Екатеринбург', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    ];

    let selectedOpponent;
    if (opponentType === 'city') {
      selectedOpponent = cityOpponents[Math.floor(Math.random() * cityOpponents.length)];
    } else if (opponentType === 'region') {
      selectedOpponent = regionOpponents[Math.floor(Math.random() * regionOpponents.length)];
    } else {
      selectedOpponent = countryOpponents[Math.floor(Math.random() * countryOpponents.length)];
    }

    setTimeout(() => {
      setOpponent(selectedOpponent);
      setSearchStatus('found');
      
      setTimeout(() => {
        setSearchStatus('starting');
      }, 2000);
    }, 2000 + Math.random() * 2000);
  }, [opponentType, navigate]);

  useEffect(() => {
    if (searchStatus === 'starting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/game?difficulty=medium&time=${timeControl}&online=true&opponent=${opponent?.name}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [searchStatus, navigate, timeControl, opponent]);

  const getTimeLabel = (time: string | null) => {
    switch(time) {
      case 'blitz': return 'Блиц 3+2';
      case 'rapid': return 'Рапид 10+5';
      case 'classic': return 'Классика 15+10';
      default: return 'Неизвестно';
    }
  };

  const getOpponentTypeLabel = (type: string | null) => {
    switch(type) {
      case 'city': return 'из вашего города';
      case 'region': return 'из вашего региона';
      case 'country': return 'из России';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-stone-900/80 border-stone-700 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          {searchStatus === 'searching' && (
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
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Поиск соперника</h2>
                <p className="text-stone-400">
                  Ищем игрока {getOpponentTypeLabel(opponentType)}
                </p>
                <p className="text-sm text-stone-500 mt-2">
                  Контроль времени: {getTimeLabel(timeControl)}
                </p>
              </div>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-stone-600 text-stone-300 hover:bg-stone-800"
              >
                Отменить поиск
              </Button>
            </div>
          )}

          {searchStatus === 'found' && opponent && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <Icon name="CheckCircle" size={64} className="text-green-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-4">Соперник найден!</h2>
                
                <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-stone-800/50 border border-stone-700">
                  <img 
                    src={opponent.avatar} 
                    alt={opponent.name} 
                    className="w-24 h-24 rounded-full ring-4 ring-amber-400"
                  />
                  <div>
                    <div className="text-xl font-bold text-stone-100">{opponent.name}</div>
                    <div className="text-sm text-stone-400">{opponent.city}</div>
                    <div className="text-lg font-bold text-amber-400 mt-2">
                      Рейтинг: {opponent.rating}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-400 mt-4">
                  {getTimeLabel(timeControl)}
                </p>
              </div>
            </div>
          )}

          {searchStatus === 'starting' && opponent && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className="text-8xl font-bold text-amber-400 animate-pulse">
                  {countdown}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Начинаем игру...</h2>
                <p className="text-stone-400">Подготовьтесь к партии</p>
              </div>

              <div className="flex items-center justify-center gap-8 p-6 rounded-lg bg-stone-800/50 border border-stone-700">
                <div className="text-center">
                  <div className="text-4xl mb-2">♔</div>
                  <div className="text-sm font-semibold text-stone-200">Вы</div>
                  <div className="text-xs text-stone-400">Белые</div>
                </div>
                
                <div className="text-3xl text-amber-400">VS</div>
                
                <div className="text-center">
                  <img 
                    src={opponent.avatar} 
                    alt={opponent.name} 
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                  <div className="text-sm font-semibold text-stone-200">{opponent.name}</div>
                  <div className="text-xs text-stone-400">Черные</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineGame;