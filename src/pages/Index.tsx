import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/chess/Navbar';
import { HomeSection, ProfileSection, LeaderboardSection, TournamentsSection, FriendsSection, NotificationsSection, HistorySection, ChatSection } from '@/components/chess/Sections';
import { AuthModal, GameSettingsModal } from '@/components/chess/Modals';

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedUser = localStorage.getItem('chessUser');
    return !!savedUser;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [chatParams, setChatParams] = useState<{ name: string; rating: number; id: string } | null>(null);

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



  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:bg-gradient-to-br transition-colors duration-300">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isAuthenticated={isAuthenticated}
        setShowGameSettings={setShowGameSettings}
        setShowAuthModal={setShowAuthModal}
        stats={stats}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <HomeSection
            isAuthenticated={isAuthenticated}
            setShowGameSettings={setShowGameSettings}
            setShowAuthModal={setShowAuthModal}
          />
        )}

        {activeSection === 'profile' && (
          <ProfileSection stats={stats} />
        )}

        {activeSection === 'leaderboard' && (
          <LeaderboardSection leaderboard={leaderboard} />
        )}

        {activeSection === 'tournaments' && (
          <TournamentsSection upcomingTournaments={upcomingTournaments} />
        )}

        {activeSection === 'friends' && (
          <FriendsSection 
            onOpenChat={(name, rating, id) => {
              setChatParams({ name, rating, id });
              setActiveSection('chat');
            }}
          />
        )}

        {activeSection === 'notifications' && (
          <NotificationsSection />
        )}

        {activeSection === 'history' && (
          <HistorySection 
            onOpenChat={(name, rating, id) => {
              setChatParams({ name, rating, id });
              setActiveSection('chat');
            }}
          />
        )}

        {activeSection === 'chat' && (
          <ChatSection 
            initialChatId={chatParams?.id}
            initialParticipantName={chatParams?.name}
            initialParticipantRating={chatParams?.rating}
          />
        )}
      </main>

      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        setIsAuthenticated={setIsAuthenticated}
        setShowGameSettings={setShowGameSettings}
      />

      <GameSettingsModal
        showGameSettings={showGameSettings}
        setShowGameSettings={setShowGameSettings}
        onStartGame={(difficulty, timeControl) => {
          navigate(`/game?difficulty=${difficulty}&time=${timeControl}`);
        }}
        onStartOnlineGame={(opponentType, timeControl) => {
          navigate(`/online-game?opponent=${opponentType}&time=${timeControl}`);
        }}
      />

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