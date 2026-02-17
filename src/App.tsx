
import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthGuard from "./components/AuthGuard";
import GameInviteNotification from "./components/GameInviteNotification";
import Icon from "@/components/ui/icon";
import API from "@/config/api";

const Game = lazy(() => import("./pages/Game"));
const OnlineGame = lazy(() => import("./pages/OnlineGame"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const DailyDecayTrigger = () => {
  useEffect(() => {
    const lastRun = localStorage.getItem('daily_decay_last');
    const today = new Date().toDateString();
    if (lastRun === today) return;
    fetch(API.applyDailyDecay, { method: 'POST' })
      .then(() => localStorage.setItem('daily_decay_last', today))
      .catch(() => {});
  }, []);
  return null;
};

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950">
    <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full" />
  </div>
);

const LandscapeBlocker = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobileUA) return;

    const checkOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isLandscape) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
      <Icon name="ScreenShareOff" size={64} className="text-amber-400 mb-6" />
      <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Переверните устройство
      </h2>
      <p className="text-slate-400 text-base max-w-xs">
        Лига Шахмат работает только в вертикальном режиме
      </p>
    </div>
  );
};

const App = () => (
  <>
    <LandscapeBlocker />
    <DailyDecayTrigger />
    <BrowserRouter>
      <GameInviteNotification />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/game" element={<AuthGuard><Game /></AuthGuard>} />
          <Route path="/online-game" element={<AuthGuard><OnlineGame /></AuthGuard>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;