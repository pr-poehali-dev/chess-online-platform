import { useState } from 'react';
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
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/70fa1147-826f-4c89-8da6-773ff084ce53.jpg" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Лига Шахмат
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? (
                <Icon name="Moon" size={22} className="text-blue-400" />
              ) : (
                <Icon name="Sun" size={22} className="text-yellow-500" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300"
              >
                <Icon name="Menu" size={24} />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 animate-scale-in">
                    <button
                      onClick={() => {
                        setActiveSection('profile');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300"
                    >
                      <Icon name="User" size={20} />
                      <span>Профиль</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10"
                    >
                      <Icon name="History" size={20} />
                      <span>История</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;