
import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthGuard from "./components/AuthGuard";
import GameInviteNotification from "./components/GameInviteNotification";
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



const App = () => (
  <>
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