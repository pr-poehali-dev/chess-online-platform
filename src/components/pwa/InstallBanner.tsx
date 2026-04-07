import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const lastDismiss = localStorage.getItem('pwa_banner_dismissed');
    if (lastDismiss) {
      const diff = Date.now() - parseInt(lastDismiss);
      if (diff < 3 * 24 * 60 * 60 * 1000) return;
    }

    const ios = /iPhone|iPad/.test(navigator.userAgent) && !('beforeinstallprompt' in window);
    setIsIOS(ios);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

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
                {isIOS
                  ? 'Добавь на экран «Домой» для игры без браузера'
                  : 'Играй в шахматы как в приложении — даже без интернета'
                }
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {isIOS ? (
              <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-300">
                  Нажми{' '}
                  <span className="inline-flex items-center gap-0.5 text-blue-400 font-medium">
                    <Icon name="Share" size={14} />
                    Поделиться
                  </span>{' '}
                  → «На экран Домой»
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
