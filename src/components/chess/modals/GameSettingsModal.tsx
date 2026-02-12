import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GameSettingsModalProps {
  showGameSettings: boolean;
  setShowGameSettings: (value: boolean) => void;
}

export const GameSettingsModal = ({ 
  showGameSettings, 
  setShowGameSettings 
}: GameSettingsModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedOpponent, setSelectedOpponent] = useState<'city' | 'region' | 'country' | 'friend' | null>(null);
  const [selectedTime, setSelectedTime] = useState<'blitz' | 'rapid' | 'classic' | null>(null);

  if (!showGameSettings) return null;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleOpponentSelect = (type: 'city' | 'region' | 'country' | 'friend') => {
    setSelectedOpponent(type);
    setStep(2);
  };

  const handleTimeSelect = (time: 'blitz' | 'rapid' | 'classic') => {
    setSelectedTime(time);
  };

  const handleStartGame = () => {
    const isRated = selectedOpponent !== 'friend';
    setShowGameSettings(false);
    alert(`Поиск соперника...\nТип: ${selectedOpponent}\nВремя: ${selectedTime}\nРейтинговая: ${isRated ? 'Да' : 'Нет'}`);
    setStep(1);
    setSelectedOpponent(null);
    setSelectedTime(null);
  };

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
              {step === 2 && 'Контроль времени'}
            </CardTitle>
            {step > 1 && <div className="w-10" />}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${
              step >= 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${
              step >= 2 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-3">
              <Button 
                className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
                onClick={() => handleOpponentSelect('city')}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Home" size={24} className="text-slate-700 dark:text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с городом</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">Соперники из вашего города</div>
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
                    <div className="text-xs text-slate-500 dark:text-gray-400">Соперники из вашего региона</div>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  className={`h-24 flex flex-col gap-2 border border-slate-200 dark:border-white/10 ${
                    selectedTime === 'blitz' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' 
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleTimeSelect('blitz')}
                >
                  <Icon name="Zap" size={24} className="text-slate-700 dark:text-white" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Блиц</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">3+2</span>
                </Button>

                <Button 
                  className={`h-24 flex flex-col gap-2 border border-slate-200 dark:border-white/10 ${
                    selectedTime === 'rapid' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' 
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleTimeSelect('rapid')}
                >
                  <Icon name="Clock" size={24} className="text-slate-700 dark:text-white" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Рапид</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">10+5</span>
                </Button>

                <Button 
                  className={`h-24 flex flex-col gap-2 border border-slate-200 dark:border-white/10 ${
                    selectedTime === 'classic' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' 
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleTimeSelect('classic')}
                >
                  <Icon name="Timer" size={24} className="text-slate-700 dark:text-white" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Классика</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">15+10</span>
                </Button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Trophy" size={20} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-slate-900 dark:text-white">
                      {selectedOpponent === 'friend' ? 'Нерейтинговая игра' : 'Рейтинговая игра'}
                    </span>
                  </div>
                  {selectedOpponent === 'friend' && (
                    <span className="text-xs text-slate-500 dark:text-gray-400">Рейтинг не изменится</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Icon name="Shuffle" size={20} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-slate-900 dark:text-white">Цвет фигур: случайный</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
