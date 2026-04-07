import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { getInstallPrompt, triggerInstall, onInstallPromptChange, isStandalone, isIOS, isMobile } from '@/lib/installPrompt';

const InstallBanner = () => {
  const [canPrompt, setCanPrompt] = useState(!!getInstallPrompt());
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const iosDevice = isIOS();

  useEffect(() => {
    if (isStandalone()) return;

    const lastDismiss = localStorage.getItem('pwa_banner_dismissed');
    if (lastDismiss) {
      const diff = Date.now() - parseInt(lastDismiss);
      if (diff < 3 * 24 * 60 * 60 * 1000) return;
    }

    if (!isMobile()) return;

    const unsub = onInstallPromptChange((prompt) => {
      setCanPrompt(!!prompt);
      if (prompt) setShowBanner(true);
    });

    const timer = setTimeout(() => setShowBanner(true), 3000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await triggerInstall();
    if (accepted) setShowBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-300 ${
        dismissed ? 'translate-y-full' : 'translate-y-0 animate-slide-up'
      }`}
    >
      <div className="mx-3 mb-3 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span className="text-2xl">♛</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">Установи Лигу Шахмат</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Играй как в приложении — даже без интернета
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="mt-3">
            {canPrompt ? (
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Download" size={18} />
                  Установить
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 text-gray-400 text-sm rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Позже
                </button>
              </div>
            ) : iosDevice ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2.5">
                  <span className="text-blue-400 font-bold text-xs w-5 text-center">1</span>
                  <span className="text-xs text-gray-300">
                    Нажми <Icon name="Share" size={13} className="inline text-blue-400 mx-0.5" /> <span className="text-blue-400 font-medium">Поделиться</span> внизу экрана
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2.5">
                  <span className="text-green-400 font-bold text-xs w-5 text-center">2</span>
                  <span className="text-xs text-gray-300">
                    Выбери <span className="text-green-400 font-medium">«На экран Домой»</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2.5">
                  <span className="text-blue-400 font-bold text-xs w-5 text-center">1</span>
                  <span className="text-xs text-gray-300">
                    Открой меню браузера <span className="text-blue-400 font-medium">⋮</span> (три точки вверху)
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2.5">
                  <span className="text-green-400 font-bold text-xs w-5 text-center">2</span>
                  <span className="text-xs text-gray-300">
                    Нажми <span className="text-green-400 font-medium">«Установить приложение»</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
