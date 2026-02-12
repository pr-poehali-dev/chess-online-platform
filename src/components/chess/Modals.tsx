import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  setIsAuthenticated: (value: boolean) => void;
  setShowGameSettings: (value: boolean) => void;
}

export const AuthModal = ({ 
  showAuthModal, 
  setShowAuthModal, 
  setIsAuthenticated, 
  setShowGameSettings 
}: AuthModalProps) => {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAuthModal(false)}>
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-center text-gray-900 dark:text-white">Добро пожаловать в ЛигаШахмат!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Для игры онлайн необходимо зарегистрироваться или войти в аккаунт
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Имя пользователя"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              className="flex-1 gradient-primary border-0 text-white"
              onClick={() => {
                setIsAuthenticated(true);
                setShowAuthModal(false);
                setShowGameSettings(true);
              }}
            >
              Регистрация
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-slate-200 dark:border-white/10"
              onClick={() => {
                setIsAuthenticated(true);
                setShowAuthModal(false);
                setShowGameSettings(true);
              }}
            >
              Войти
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Регистрируясь, вы соглашаетесь с правилами сервиса
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

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
