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
  if (!showGameSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowGameSettings(false)}>
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="Settings" size={24} />
            Настройки игры
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Контроль времени
            </label>
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
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Рейтинговая игра
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                Рейтинговая
              </Button>
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                Дружеская
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Цвет фигур
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                ⚪ Белые
              </Button>
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                ⚫ Черные
              </Button>
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                🎲 Случайно
              </Button>
            </div>
          </div>

          <Button 
            className="w-full gradient-primary border-0 text-white h-12"
            onClick={() => {
              setShowGameSettings(false);
              alert('Поиск соперника...');
            }}
          >
            <Icon name="Play" className="mr-2" size={20} />
            Начать игру
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
