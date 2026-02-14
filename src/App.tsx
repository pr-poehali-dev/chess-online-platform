
import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import Index from "./pages/Index";
import AuthGuard from "./components/AuthGuard";
import GameInviteNotification from "./components/GameInviteNotification";
import API from "@/config/api";

const Game = lazy(() => import("./pages/Game"));
const OnlineGame = lazy(() => import("./pages/OnlineGame"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const DailyDecayTrigger = () => {
  useEffect(() => {
    fetch(API.applyDailyDecay, { method: 'POST' }).catch(() => {});
  }, []);
  return null;
};

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950">
    <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full" />
  </div>
);

const GameWithKey = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('online_game_id') || searchParams.get('t') || 'default';
  return <Game key={key} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DailyDecayTrigger />
      <BrowserRouter>
        <GameInviteNotification />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<AuthGuard><GameWithKey /></AuthGuard>} />
            <Route path="/online-game" element={<AuthGuard><OnlineGame /></AuthGuard>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;