import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/chess/Navbar";
import MainContent from "@/pages/index/MainContent";
import IndexModals from "@/pages/index/IndexModals";
import IndexFooter from "@/pages/index/IndexFooter";
import getDeviceToken from "@/lib/deviceToken";
import { cachedUserCheck, cachedGameHistory } from "@/lib/apiCache";

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
        const data = await cachedUserCheck(userId, dt);

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

    cachedGameHistory(userId)
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
    { rank: 1, name: "Евгения Малыхина", rating: 2456, avatar: "🏆" },
    { rank: 2, name: "Костя Шапран", rating: 2398, avatar: "👑" },
    { rank: 3, name: "Владик Гурин", rating: 2356, avatar: "⭐" },
    { rank: 4, name: "Женя Севрюгин", rating: 2287, avatar: "💎" },
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

      <MainContent
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        setShowGameSettings={setShowGameSettings}
        setShowAuthModal={setShowAuthModal}
        setShowOfflineGameModal={setShowOfflineGameModal}
        stats={stats}
        leaderboard={leaderboard}
        upcomingTournaments={upcomingTournaments}
        chatParams={chatParams}
        setChatParams={setChatParams}
        pendingInviteCode={pendingInviteCode}
        setPendingInviteCode={setPendingInviteCode}
      />

      <IndexModals
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        setIsAuthenticated={setIsAuthenticated}
        pendingInviteCode={pendingInviteCode}
        setShowGameSettings={setShowGameSettings}
        showGameSettings={showGameSettings}
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
        showOfflineGameModal={showOfflineGameModal}
        setShowOfflineGameModal={setShowOfflineGameModal}
        onOfflineRegister={(data) => {
          console.log("Регистрация на офлайн игру:", data);
          setOfflineRegMsg(
            `Вы зарегистрированы на игру\nДень: ${data.day}\nВремя: ${data.time}${data.district ? `\nРайон: ${data.district}` : ""}`,
          );
        }}
        offlineRegMsg={offlineRegMsg}
        setOfflineRegMsg={setOfflineRegMsg}
      />

      <IndexFooter />
    </div>
  );
};

export default Index;
