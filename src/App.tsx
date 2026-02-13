
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Game from "./pages/Game";
import OnlineGame from "./pages/OnlineGame";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const DECAY_URL = 'https://functions.poehali.dev/06f73421-41be-448f-a352-17e488dc15ef';

const queryClient = new QueryClient();

const DailyDecayTrigger = () => {
  useEffect(() => {
    fetch(DECAY_URL, { method: 'POST' }).catch(() => {});
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DailyDecayTrigger />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/game" element={<Game />} />
          <Route path="/online-game" element={<OnlineGame />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;