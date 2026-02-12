import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
  stats: {
    games: number;
    wins: number;
    rating: number;
    tournaments: number;
  };
}

const Navbar = ({ 
  activeSection, 
  setActiveSection, 
  isDarkMode, 
  setIsDarkMode, 
  isAuthenticated,
  setShowGameSettings,
  setShowAuthModal,
  stats 
}: NavbarProps) => {
  return (
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
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  setShowGameSettings(true);
                } else {
                  setShowAuthModal(true);
                }
              }}
              className="gradient-primary border-0 text-white hover:opacity-90"
            >
              <Icon name="Play" className="mr-2" size={18} />
              Играть онлайн
            </Button>
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
  );
};

export default Navbar;
