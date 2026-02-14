import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/chess/Navbar";
import {
  HomeSection,
  ProfileSection,
  LeaderboardSection,
  TournamentsSection,
  FriendsSection,
  NotificationsSection,
  HistorySection,
  ChatSection,
} from "@/components/chess/Sections";
import {
  AuthModal,
  GameSettingsModal,
  OfflineGameModal,
} from "@/components/chess/Modals";
import { ConfirmDialog } from "@/pages/game/ConfirmDialog";
import Icon from "@/components/ui/icon";
import API from "@/config/api";
import getDeviceToken from "@/lib/deviceToken";
const GAME_HISTORY_URL = API.gameHistory;
const USER_CHECK_URL = API.userCheck;

const Index = () => {
  const navigate = useNavigate();
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(
    () => {
      const params = new URLSearchParams(window.location.search);
      return params.get("invite");
    },
  );
  const [activeSection, setActiveSection] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || savedTheme === null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [showOfflineGameModal, setShowOfflineGameModal] = useState(false);
  const [chatParams, setChatParams] = useState<{
    name: string;
    rating: number;
    id: string;
  } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("chessUser");
      if (!savedUser) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        const params = new URLSearchParams(window.location.search);
        if (params.get("invite")) {
          setShowAuthModal(true);
        }
        return;
      }

      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.email || userData.name || "anonymous";
        const userId =
          "u_" + rawId.replace(/[^a-zA-Z0-9@._-]/g, "").substring(0, 60);
        const dt = getDeviceToken();
        const res = await fetch(
          `${USER_CHECK_URL}?user_id=${encodeURIComponent(userId)}&device_token=${encodeURIComponent(dt)}`,
        );
        const data = await res.json();

        if (data.exists && data.session_valid !== false) {
          setIsAuthenticated(true);
          const params = new URLSearchParams(window.location.search);
          if (params.get("invite")) {
            setActiveSection("friends");
          }
        } else if (data.exists && data.session_valid === false) {
          localStorage.removeItem("chessUser");
          setIsAuthenticated(false);
          setShowAuthModal(true);
        } else {
          localStorage.removeItem("chessUser");
          setIsAuthenticated(false);
          const params = new URLSearchParams(window.location.search);
          if (params.get("invite")) {
            setShowAuthModal(true);
          }
        }
      } catch {
        const savedU = localStorage.getItem("chessUser");
        setIsAuthenticated(!!savedU);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const [stats, setStats] = useState({
    games: 0,
    wins: 0,
    rating: 1200,
    tournaments: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !authChecked) return;
    const savedUser = localStorage.getItem("chessUser");
    if (!savedUser) return;
    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || "anonymous";
    const userId =
      "u_" + rawId.replace(/[^a-zA-Z0-9@._-]/g, "").substring(0, 60);

    fetch(`${GAME_HISTORY_URL}?user_id=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setStats({
            games: data.user.games_played || 0,
            wins: data.user.wins || 0,
            rating: data.user.rating || 1200,
            tournaments: 0,
          });
        }
      })
      .catch(() => {});
  }, [isAuthenticated, authChecked]);

  useEffect(() => {
    if (isAuthenticated && pendingInviteCode) {
      setActiveSection("friends");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isAuthenticated, pendingInviteCode]);

  const leaderboard = [
    { rank: 1, name: "Александр Петров", rating: 2456, avatar: "🏆" },
    { rank: 2, name: "Мария Смирнова", rating: 2398, avatar: "👑" },
    { rank: 3, name: "Дмитрий Иванов", rating: 2356, avatar: "⭐" },
    { rank: 4, name: "Елена Козлова", rating: 2287, avatar: "💎" },
    { rank: 5, name: "Вы", rating: 1842, avatar: "🎯", highlight: true },
  ];

  const upcomingTournaments = [
    {
      id: 1,
      name: "Чемпионат Быстрых Партий",
      date: "15 Февраля 2026",
      prize: "50 000 ₽",
      participants: 64,
      format: "Блиц 3+2",
    },
    {
      id: 2,
      name: "Кубок Гроссмейстеров",
      date: "22 Февраля 2026",
      prize: "100 000 ₽",
      participants: 32,
      format: "Классика 15+10",
    },
    {
      id: 3,
      name: "Весенний Марафон",
      date: "1 Марта 2026",
      prize: "30 000 ₽",
      participants: 128,
      format: "Рапид 10+5",
    },
  ];

  const [offlineRegMsg, setOfflineRegMsg] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("ligachess.ru@mail.ru");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:bg-gradient-to-br transition-colors duration-300 overflow-x-hidden">
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
        {activeSection === "home" && (
          <HomeSection
            isAuthenticated={isAuthenticated}
            setShowGameSettings={setShowGameSettings}
            setShowAuthModal={setShowAuthModal}
            setShowOfflineGameModal={setShowOfflineGameModal}
          />
        )}

        {activeSection === "profile" && isAuthenticated && (
          <ProfileSection
            stats={stats}
            onLogout={() => {
              localStorage.removeItem("chessUser");
              setIsAuthenticated(false);
              setActiveSection("home");
            }}
          />
        )}

        {activeSection === "leaderboard" && (
          <LeaderboardSection leaderboard={leaderboard} />
        )}

        {activeSection === "tournaments" && (
          <TournamentsSection upcomingTournaments={upcomingTournaments} />
        )}

        {activeSection === "friends" && isAuthenticated && (
          <FriendsSection
            onOpenChat={(name, rating, id) => {
              setChatParams({ name, rating, id });
              setActiveSection("chat");
            }}
            pendingInviteCode={pendingInviteCode}
            onInviteProcessed={() => setPendingInviteCode(null)}
          />
        )}

        {activeSection === "notifications" && isAuthenticated && (
          <NotificationsSection />
        )}

        {activeSection === "history" && isAuthenticated && (
          <HistorySection
            onOpenChat={(name, rating, id) => {
              setChatParams({ name, rating, id });
              setActiveSection("chat");
            }}
          />
        )}

        {activeSection === "chat" && isAuthenticated && (
          <ChatSection
            initialChatId={chatParams?.id}
            initialParticipantName={chatParams?.name}
            initialParticipantRating={chatParams?.rating}
          />
        )}

        {!isAuthenticated &&
          ["profile", "friends", "notifications", "history", "chat"].includes(
            activeSection,
          ) && (
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
          localStorage.setItem(
            "lastGameSettings",
            JSON.stringify({ time: timeControl, color }),
          );
          navigate(
            `/game?difficulty=${difficulty}&time=${encodeURIComponent(timeControl)}&color=${color}`,
          );
        }}
        onStartOnlineGame={(opponentType, timeControl, color) => {
          localStorage.setItem(
            "lastGameSettings",
            JSON.stringify({ time: timeControl, color }),
          );
          navigate(
            `/online-game?opponent=${opponentType}&time=${encodeURIComponent(timeControl)}&color=${color}`,
          );
        }}
      />

      <OfflineGameModal
        showModal={showOfflineGameModal}
        setShowModal={setShowOfflineGameModal}
        onRegister={(data) => {
          console.log("Регистрация на офлайн игру:", data);
          setOfflineRegMsg(
            `Вы зарегистрированы на игру\nДень: ${data.day}\nВремя: ${data.time}${data.district ? `\nРайон: ${data.district}` : ""}`,
          );
        }}
      />

      <ConfirmDialog
        open={!!offlineRegMsg}
        message={offlineRegMsg || ""}
        title="Регистрация"
        variant="info"
        alertOnly
        onConfirm={() => setOfflineRegMsg(null)}
        onCancel={() => setOfflineRegMsg(null)}
      />

      <footer className="border-t border-slate-200 dark:border-white/10 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2026 Лига Шахмат. Все права защищены.</p>
          <div className="flex justify-center gap-6 mt-4">
            <button
              onClick={() => { setShowRules(!showRules); setShowSupport(false); }}
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Правила
            </button>
            <button
              onClick={() => { setShowSupport(!showSupport); setShowRules(false); }}
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Поддержка
            </button>
          </div>

          {showRules && (
            <div className="mt-6 max-w-2xl mx-auto text-left bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Правила шахмат</h3>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                <p>В шахматы играют на квадратной доске, состоящей из восьми рядов (называемых горизонталями и обозначаемых числами от 1 до 8) и восьми столбцов (называемых вертикалями и обозначаемых буквами от a до h). Цвета шестидесяти четырех клеток чередуются между светлыми и темными и называются «светлыми клетками» и «темными клетками». Шахматная доска располагается таким образом, чтобы у каждого игрока была белая клетка в правом верхнем углу, а фигуры расставляются, как показано на схеме, причем каждая ферзь находится на клетке соответствующего цвета.</p>
                <p>Каждый игрок начинает игру с шестнадцатью фигурами: у каждого игрока один король, одна ферзь, две ладьи, два слона, два коня и восемь пешек. Один игрок, называемый Белыми, управляет белыми фигурами, а другой игрок, Черный, — черными; Белые всегда ходят первыми. Цвета выбираются либо по дружеской договоренности, либо в результате случайной игры, либо по решению организатора турнира. Игроки по очереди ходят по одной фигуре за раз (за исключением рокировки, когда ходят две фигуры одновременно). Фигуры перемещаются либо на свободное поле, либо на поле, занятое фигурой противника, захватывая ее и удаляя из игры. За одним исключением (на проходе), все фигуры захватывают фигуры противника, перемещаясь на поле, которое занимает фигура противника.</p>
              </div>
            </div>
          )}

          {showSupport && (
            <div className="mt-6 max-w-md mx-auto animate-fade-in">
              <button
                onClick={copyEmail}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Icon name="Mail" size={18} className="text-blue-500" />
                <span className="text-slate-900 dark:text-white font-medium">ligachess.ru@mail.ru</span>
                <Icon name={copied ? "Check" : "Copy"} size={16} className={copied ? "text-green-500" : "text-gray-400"} />
              </button>
              {copied && <p className="text-green-500 text-sm mt-2">Скопировано!</p>}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;