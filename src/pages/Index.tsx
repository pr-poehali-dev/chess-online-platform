import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/chess/Navbar';
import { HomeSection, ProfileSection, LeaderboardSection, TournamentsSection, FriendsSection, NotificationsSection, HistorySection, ChatSection } from '@/components/chess/Sections';
import { AuthModal, GameSettingsModal, OfflineGameModal } from '@/components/chess/Modals';
import API from '@/config/api';
const GAME_HISTORY_URL = API.gameHistory;
const USER_CHECK_URL = API.userCheck;

const Index = () => {
  const navigate = useNavigate();
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  });
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [showOfflineGameModal, setShowOfflineGameModal] = useState(false);
  const [chatParams, setChatParams] = useState<{ name: string; rating: number; id: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('chessUser');
      if (!savedUser) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        const params = new URLSearchParams(window.location.search);
        if (params.get('invite')) {
          setShowAuthModal(true);
        }
        return;
      }

      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.email || userData.name || 'anonymous';
        const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        const res = await fetch(`${USER_CHECK_URL}?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (data.exists) {
          setIsAuthenticated(true);
          const params = new URLSearchParams(window.location.search);
          if (params.get('invite')) {
            setActiveSection('friends');
          }
        } else {
          localStorage.removeItem('chessUser');
          setIsAuthenticated(false);
          const params = new URLSearchParams(window.location.search);
          if (params.get('invite')) {
            setShowAuthModal(true);
          }
        }
      } catch {
        const savedU = localStorage.getItem('chessUser');
        setIsAuthenticated(!!savedU);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [stats, setStats] = useState({
    games: 0,
    wins: 0,
    rating: 1200,
    tournaments: 0
  });

  useEffect(() => {
    if (!isAuthenticated || !authChecked) return;
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return;
    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);

    fetch(`${GAME_HISTORY_URL}?user_id=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setStats({
            games: data.user.games_played || 0,
            wins: data.user.wins || 0,
            rating: data.user.rating || 1200,
            tournaments: 0
          });
        }
      })
      .catch(() => {});
  }, [isAuthenticated, authChecked]);

  useEffect(() => {
    if (isAuthenticated && pendingInviteCode) {
      setActiveSection('friends');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isAuthenticated, pendingInviteCode]);

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

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {activeSection === 'home' && (
          <HomeSection
            isAuthenticated={isAuthenticated}
            setShowGameSettings={setShowGameSettings}
            setShowAuthModal={setShowAuthModal}
            setShowOfflineGameModal={setShowOfflineGameModal}
          />
        )}

        {activeSection === 'profile' && isAuthenticated && (
          <ProfileSection stats={stats} onLogout={() => {
            localStorage.removeItem('chessUser');
            setIsAuthenticated(false);
            setActiveSection('home');
          }} />
        )}

        {activeSection === 'leaderboard' && (
          <LeaderboardSection leaderboard={leaderboard} />
        )}

        {activeSection === 'tournaments' && (
          <TournamentsSection upcomingTournaments={upcomingTournaments} />
        )}

        {activeSection === 'friends' && isAuthenticated && (
          <FriendsSection 
            onOpenChat={(name, rating, id) => {
              setChatParams({ name, rating, id });
              setActiveSection('chat');
            }}
            pendingInviteCode={pendingInviteCode}
            onInviteProcessed={() => setPendingInviteCode(null)}
          />
        )}

        {activeSection === 'notifications' && isAuthenticated && (
          <NotificationsSection />
        )}

        {activeSection === 'history' && isAuthenticated && (
          <HistorySection 
            onOpenChat={(name, rating, id) => {
              setChatParams({ name, rating, id });
              setActiveSection('chat');
            }}
          />
        )}

        {activeSection === 'chat' && isAuthenticated && (
          <ChatSection 
            initialChatId={chatParams?.id}
            initialParticipantName={chatParams?.name}
            initialParticipantRating={chatParams?.rating}
          />
        )}

        {!isAuthenticated && ['profile', 'friends', 'notifications', 'history', 'chat'].includes(activeSection) && (
          <HomeSection
            isAuthenticated={isAuthenticated}
            setShowGameSettings={setShowGameSettings}
            setShowAuthModal={setShowAuthModal}
            setShowOfflineGameModal={setShowOfflineGameModal}
          />
        )}
      </main>

      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        setIsAuthenticated={setIsAuthenticated}
        setShowGameSettings={pendingInviteCode ? () => {} : setShowGameSettings}
      />

      <GameSettingsModal
        showGameSettings={showGameSettings}
        setShowGameSettings={setShowGameSettings}
        onStartGame={(difficulty, timeControl, color) => {
          localStorage.setItem('lastGameSettings', JSON.stringify({ time: timeControl, color }));
          navigate(`/game?difficulty=${difficulty}&time=${encodeURIComponent(timeControl)}&color=${color}`);
        }}
        onStartOnlineGame={(opponentType, timeControl, color) => {
          localStorage.setItem('lastGameSettings', JSON.stringify({ time: timeControl, color }));
          navigate(`/online-game?opponent=${opponentType}&time=${encodeURIComponent(timeControl)}&color=${color}`);
        }}
      />

      <OfflineGameModal
        showModal={showOfflineGameModal}
        setShowModal={setShowOfflineGameModal}
        onRegister={(data) => {
          console.log('Регистрация на офлайн игру:', data);
          alert(`Вы зарегистрированы на игру\nДень: ${data.day}\nВремя: ${data.time}${data.district ? `\nРайон: ${data.district}` : ''}`);
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