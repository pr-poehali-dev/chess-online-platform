import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cityRegions } from '@/components/chess/data/cities';

interface GameSettingsModalProps {
  showGameSettings: boolean;
  setShowGameSettings: (value: boolean) => void;
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard' | 'master', timeControl: string, color: 'white' | 'black' | 'random') => void;
  onStartOnlineGame?: (opponentType: 'city' | 'region' | 'country', timeControl: string, color: 'white' | 'black' | 'random') => void;
}

const timeCategories = [
  {
    name: 'Пуля',
    icon: 'Rocket',
    options: [
      { label: '1 минута', value: '1+0' },
      { label: '1 + 1', value: '1+1' },
      { label: '2 + 1', value: '2+1' },
    ]
  },
  {
    name: 'Блиц',
    icon: 'Zap',
    options: [
      { label: '3 минуты', value: '3+0' },
      { label: '3 + 2', value: '3+2' },
      { label: '5 минут', value: '5+0' },
      { label: '5 + 5', value: '5+5' },
      { label: '5 + 2', value: '5+2' },
    ]
  },
  {
    name: 'Рапид',
    icon: 'Timer',
    options: [
      { label: '10 минут', value: '10+0' },
      { label: '15 + 10', value: '15+10' },
      { label: '30 минут', value: '30+0' },
      { label: '10 + 5', value: '10+5' },
      { label: '20 минут', value: '20+0' },
      { label: '60 минут', value: '60+0' },
    ]
  }
];

export const GameSettingsModal = ({ 
  showGameSettings, 
  setShowGameSettings,
  onStartGame,
  onStartOnlineGame
}: GameSettingsModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedOpponent, setSelectedOpponent] = useState<'city' | 'region' | 'country' | 'friend' | 'computer' | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'master' | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | 'random'>('random');
  const [userCity, setUserCity] = useState<string>('');
  const [userRegion, setUserRegion] = useState<string>('');
  const [lastGameSettings, setLastGameSettings] = useState<{
    opponent: 'city' | 'region' | 'country' | 'friend' | 'computer';
    time: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'master';
    color?: 'white' | 'black' | 'random';
  } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.city) {
        setUserCity(userData.city);
        setUserRegion(cityRegions[userData.city] || '');
      }
    }
    
    const savedSettings = localStorage.getItem('lastGameSettings');
    if (savedSettings) {
      setLastGameSettings(JSON.parse(savedSettings));
    }
  }, [showGameSettings]);

  const friends = [
    { id: '1', name: 'Иван Петров', rating: 1756, avatar: '👤', city: 'Москва' },
    { id: '2', name: 'Мария Сидорова', rating: 1834, avatar: '👤', city: 'Санкт-Петербург' },
    { id: '3', name: 'Алексей Козлов', rating: 1678, avatar: '👤', city: 'Казань' },
    { id: '4', name: 'Ольга Новикова', rating: 1923, avatar: '👤', city: 'Екатеринбург' },
    { id: '5', name: 'Дмитрий Волков', rating: 1789, avatar: '👤', city: 'Новосибирск' },
  ];

  if (!showGameSettings) return null;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2 && selectedOpponent === 'friend') {
        setSelectedFriend(null);
      }
      if (step === 2 && selectedOpponent === 'computer') {
        setSelectedDifficulty(null);
      }
    }
  };

  const handleOpponentSelect = (type: 'city' | 'region' | 'country' | 'friend' | 'computer') => {
    setSelectedOpponent(type);
    if (type === 'friend') {
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriend(friendId);
    setStep(3);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard' | 'master') => {
    setSelectedDifficulty(difficulty);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const cycleColor = () => {
    setSelectedColor(prev => {
      if (prev === 'random') return 'white';
      if (prev === 'white') return 'black';
      return 'random';
    });
  };

  const getColorLabel = () => {
    switch (selectedColor) {
      case 'white': return 'Белые';
      case 'black': return 'Черные';
      case 'random': return 'Случайный';
    }
  };

  const getColorIcon = () => {
    switch (selectedColor) {
      case 'white': return '♔';
      case 'black': return '♚';
      case 'random': return '🎲';
    }
  };

  const resetState = () => {
    setStep(1);
    setSelectedOpponent(null);
    setSelectedTime(null);
    setSelectedFriend(null);
    setSelectedDifficulty(null);
  };

  const handleStartGame = () => {
    if (selectedOpponent === 'computer' && selectedDifficulty && selectedTime) {
      const settings = {
        opponent: selectedOpponent,
        time: selectedTime,
        difficulty: selectedDifficulty,
        color: selectedColor
      };
      localStorage.setItem('lastGameSettings', JSON.stringify(settings));
      
      onStartGame(selectedDifficulty, selectedTime, selectedColor);
      setShowGameSettings(false);
      resetState();
    } else if (selectedOpponent && selectedTime) {
      const settings = {
        opponent: selectedOpponent,
        time: selectedTime,
        color: selectedColor
      };
      localStorage.setItem('lastGameSettings', JSON.stringify(settings));
      
      if ((selectedOpponent === 'city' || selectedOpponent === 'region' || selectedOpponent === 'country') && onStartOnlineGame) {
        onStartOnlineGame(selectedOpponent, selectedTime, selectedColor);
      } else {
        alert(`Поиск соперника...\nТип: ${selectedOpponent}\nВремя: ${selectedTime}`);
      }
      
      setShowGameSettings(false);
      resetState();
    }
  };

  const handleQuickStart = () => {
    if (!lastGameSettings) return;
    const color = lastGameSettings.color || 'random';
    
    if (lastGameSettings.opponent === 'computer' && lastGameSettings.difficulty) {
      onStartGame(lastGameSettings.difficulty, lastGameSettings.time, color);
      setShowGameSettings(false);
    } else if ((lastGameSettings.opponent === 'city' || lastGameSettings.opponent === 'region' || lastGameSettings.opponent === 'country') && onStartOnlineGame) {
      onStartOnlineGame(lastGameSettings.opponent, lastGameSettings.time, color);
      setShowGameSettings(false);
    } else {
      setShowGameSettings(false);
      alert(`Поиск соперника...\nТип: ${lastGameSettings.opponent}\nВремя: ${lastGameSettings.time}`);
    }
  };

  const getOpponentLabel = (type: string) => {
    switch(type) {
      case 'city': return 'Город';
      case 'region': return 'Регион';
      case 'country': return 'Страна';
      case 'friend': return 'Друг';
      case 'computer': return 'Компьютер';
      default: return type;
    }
  };

  const getTimeLabel = (time: string) => {
    if (time.includes('+')) {
      const [mins, inc] = time.split('+');
      if (inc === '0') return `${mins} мин`;
      return `${mins}+${inc}`;
    }
    switch(time) {
      case 'blitz': return 'Блиц 3+2';
      case 'rapid': return 'Рапид 10+5';
      case 'classic': return 'Классика 15+10';
      default: return time;
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch(difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      case 'master': return 'Мастер';
      default: return '';
    }
  };

  const getStepCount = () => {
    if (selectedOpponent === 'friend' || selectedOpponent === 'computer') {
      return 3;
    }
    return 2;
  };

  const renderTimeSelection = () => (
    <div className="space-y-4">
      <div className="max-h-[50vh] overflow-y-auto space-y-5 pr-1">
        {timeCategories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={category.icon} size={18} className="text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{category.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {category.options.map((option) => (
                <Button
                  key={option.value}
                  className={`h-12 text-sm font-medium border ${
                    selectedTime === option.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                  }`}
                  onClick={() => handleTimeSelect(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div 
        className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        onClick={cycleColor}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getColorIcon()}</span>
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Цвет фигур</span>
              <div className="text-xs text-slate-500 dark:text-gray-400">Нажмите для смены</div>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{getColorLabel()}</span>
        </div>
      </div>

      <Button 
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleStartGame}
        disabled={!selectedTime}
      >
        <Icon name="Play" className="mr-2" size={20} />
        Начать игру
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowGameSettings(false)}>
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            {step > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400"
              >
                <Icon name="ChevronLeft" size={24} />
              </Button>
            )}
            <CardTitle className="flex-1 text-center text-gray-900 dark:text-white">
              {step === 1 && 'Выбор противника'}
              {step === 2 && selectedOpponent === 'friend' && 'Выбор друга'}
              {step === 2 && selectedOpponent === 'computer' && 'Уровень сложности'}
              {step === 2 && selectedOpponent !== 'friend' && selectedOpponent !== 'computer' && 'Время'}
              {step === 3 && 'Время'}
            </CardTitle>
            {step > 1 && <div className="w-10" />}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: getStepCount() }).map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 w-10 rounded-full transition-colors ${
                  step >= i + 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
                }`} 
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
         
          {step === 1 && (
            <div className="space-y-3">
              {lastGameSettings && (
                <Button 
                  className="w-full h-20 flex items-center justify-between bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 border-2 border-green-600 dark:border-green-500 shadow-lg"
                  onClick={handleQuickStart}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Zap" size={28} className="text-white" />
                    <div className="text-left">
                      <div className="text-base font-bold text-white">Быстрый старт</div>
                      <div className="text-xs text-green-100">
                        {getOpponentLabel(lastGameSettings.opponent)} • {getTimeLabel(lastGameSettings.time)}
                        {lastGameSettings.difficulty && ` • ${getDifficultyLabel(lastGameSettings.difficulty)}`}
                      </div>
                    </div>
                  </div>
                  <Icon name="Play" size={24} className="text-white" />
                </Button>
              )}
              
              <Button 
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleOpponentSelect('city')}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Home" size={24} className="text-slate-700 dark:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с городом</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {userCity ? `Соперники из ${userCity}` : 'Соперники из вашего города'}
                    </div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button 
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleOpponentSelect('region')}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Map" size={24} className="text-slate-700 dark:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с регионом</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {userRegion ? `Соперники из ${userRegion}` : 'Соперники из вашего региона'}
                    </div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button 
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleOpponentSelect('country')}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Globe" size={24} className="text-slate-700 dark:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Играть со всей страной</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Соперники со всей России</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button 
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleOpponentSelect('friend')}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Users" size={24} className="text-slate-700 dark:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с другом</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Нерейтинговая игра</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button 
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleOpponentSelect('computer')}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Bot" size={24} className="text-slate-700 dark:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с компьютером</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Тренировочная игра</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>
            </div>
          )}

          {step === 2 && selectedOpponent === 'friend' && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Выберите друга для игры
              </div>
              {friends.map((friend) => (
                <Button
                  key={friend.id}
                  className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                  onClick={() => handleFriendSelect(friend.id)}
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
          )}

          {step === 2 && selectedOpponent === 'computer' && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Выберите уровень сложности
              </div>
              <Button
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleDifficultySelect('easy')}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🟢</div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Легкий</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Рейтинг: 800-1000 • Для начинающих</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleDifficultySelect('medium')}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🟡</div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Средний</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Рейтинг: 1200-1500 • Любители</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleDifficultySelect('hard')}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🟠</div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Сложный</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Рейтинг: 1800-2000 • Опытные</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>

              <Button
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleDifficultySelect('master')}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔴</div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Мастер</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Рейтинг: 2200+ • Для профессионалов</div>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-slate-400" />
              </Button>
            </div>
          )}

          {((step === 2 && selectedOpponent !== 'friend' && selectedOpponent !== 'computer') || step === 3) && renderTimeSelection()}
        </CardContent>
      </Card>
    </div>
  );
};
