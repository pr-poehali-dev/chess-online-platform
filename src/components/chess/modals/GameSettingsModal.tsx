import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cityRegions } from '@/components/chess/data/cities';
import OpponentSelectStep from './game-settings/OpponentSelectStep';
import FriendAndDifficultyStep from './game-settings/FriendAndDifficultyStep';
import TimeSelectStep from './game-settings/TimeSelectStep';

interface GameSettingsModalProps {
  showGameSettings: boolean;
  setShowGameSettings: (value: boolean) => void;
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard' | 'master', timeControl: string, color: 'white' | 'black' | 'random') => void;
  onStartOnlineGame?: (opponentType: 'city' | 'region' | 'country', timeControl: string, color: 'white' | 'black' | 'random') => void;
}

const friends = [
  { id: '1', name: 'Иван Петров', rating: 1756, avatar: '👤', city: 'Москва' },
  { id: '2', name: 'Мария Сидорова', rating: 1834, avatar: '👤', city: 'Санкт-Петербург' },
  { id: '3', name: 'Алексей Козлов', rating: 1678, avatar: '👤', city: 'Казань' },
  { id: '4', name: 'Ольга Новикова', rating: 1923, avatar: '👤', city: 'Екатеринбург' },
  { id: '5', name: 'Дмитрий Волков', rating: 1789, avatar: '👤', city: 'Новосибирск' },
];

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

export const GameSettingsModal = ({ 
  showGameSettings, 
  setShowGameSettings,
  onStartGame,
  onStartOnlineGame
}: GameSettingsModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedOpponent, setSelectedOpponent] = useState<'city' | 'region' | 'country' | 'friend' | 'computer' | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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

  if (!showGameSettings) return null;

  const resetState = () => {
    setStep(1);
    setSelectedOpponent(null);
    setSelectedTime(null);
    setSelectedDifficulty(null);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2 && selectedOpponent === 'friend') {
        // reset handled by step change
      }
      if (step === 2 && selectedOpponent === 'computer') {
        setSelectedDifficulty(null);
      }
    }
  };

  const handleOpponentSelect = (type: 'city' | 'region' | 'country' | 'friend' | 'computer') => {
    setSelectedOpponent(type);
    setStep(2);
  };

  const handleFriendSelect = (_friendId: string) => {
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

  const getStepCount = () => {
    if (selectedOpponent === 'friend' || selectedOpponent === 'computer') {
      return 3;
    }
    return 2;
  };

  const showTimeStep = (step === 2 && selectedOpponent !== 'friend' && selectedOpponent !== 'computer') || step === 3;
  const showFriendOrDifficulty = step === 2 && (selectedOpponent === 'friend' || selectedOpponent === 'computer');

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
            <OpponentSelectStep
              userCity={userCity}
              userRegion={userRegion}
              lastGameSettings={lastGameSettings}
              onQuickStart={handleQuickStart}
              onSelect={handleOpponentSelect}
              getOpponentLabel={getOpponentLabel}
              getTimeLabel={getTimeLabel}
              getDifficultyLabel={getDifficultyLabel}
            />
          )}

          {showFriendOrDifficulty && (
            <FriendAndDifficultyStep
              selectedOpponent={selectedOpponent}
              friends={friends}
              onFriendSelect={handleFriendSelect}
              onDifficultySelect={handleDifficultySelect}
            />
          )}

          {showTimeStep && (
            <TimeSelectStep
              selectedTime={selectedTime}
              selectedColor={selectedColor}
              onTimeSelect={handleTimeSelect}
              onCycleColor={cycleColor}
              onStartGame={handleStartGame}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
