import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { SiteSettingsData } from "./useHomeData";

interface HomeActionButtonsProps {
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
  setShowOfflineGameModal: (value: boolean) => void;
  siteSettings: SiteSettingsData | null;
  isButtonVisible: (btnKey: string) => boolean;
  isLevelAllowed: (levelKey: string) => boolean;
  lockedMessage: string | null;
  setLockedMessage: (value: string | null) => void;
}

export const HomeActionButtons = ({
  isAuthenticated,
  setShowGameSettings,
  setShowAuthModal,
  setShowOfflineGameModal,
  siteSettings,
  isButtonVisible,
  isLevelAllowed,
  lockedMessage,
  setLockedMessage,
}: HomeActionButtonsProps) => {
  return (
    <div className="text-center pt-1 sm:pt-2 pb-0">
      <div className="flex flex-col items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 animate-slide-up max-w-md mx-auto px-2 sm:px-1">
        {isButtonVisible("btn_play_online") && (
          <div className="w-full relative">
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-0 px-4 sm:px-12 py-3 sm:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-xl transition-all shadow-lg min-h-[44px] hover:scale-105"
              onClick={() => {
                if (isAuthenticated) {
                  setShowGameSettings(true);
                } else {
                  setShowAuthModal(true);
                }
              }}
            >
              <Icon name="Play" className="mr-2" size={24} />
              Играть онлайн
            </Button>
          </div>
        )}

        {isButtonVisible("btn_play_offline") && (
          <div className="w-full relative">
            <Button
              size="lg"
              className={`w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-0 px-4 sm:px-12 py-3 sm:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-xl transition-all shadow-lg min-h-[44px] ${!isLevelAllowed("level_play_offline") ? "opacity-60 cursor-not-allowed hover:scale-100" : "hover:scale-105"}`}
              onClick={() => {
                if (!isLevelAllowed("level_play_offline")) {
                  const minR = siteSettings?.level_play_offline?.value || "0";
                  setLockedMessage(`Доступно с рейтингом выше ${minR}`);
                  setTimeout(() => setLockedMessage(null), 3000);
                  return;
                }
                if (isAuthenticated) {
                  setShowOfflineGameModal(true);
                } else {
                  setShowAuthModal(true);
                }
              }}
            >
              <Icon name="Gamepad2" className="mr-2" size={24} />
              Играть офлайн
              {!isLevelAllowed("level_play_offline") && (
                <Icon name="Lock" className="ml-2" size={18} />
              )}
            </Button>
          </div>
        )}

        {isButtonVisible("btn_tournament") && (
          <div className="w-full relative">
            <Button
              size="lg"
              className={`w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white border-0 px-4 sm:px-12 py-3 sm:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-xl transition-all shadow-lg min-h-[44px] ${!isLevelAllowed("level_tournament") ? "opacity-60 cursor-not-allowed hover:scale-100" : "hover:scale-105"}`}
              onClick={() => {
                if (!isLevelAllowed("level_tournament")) {
                  const minR =
                    siteSettings?.level_tournament?.value || "1000";
                  setLockedMessage(`Доступно с рейтингом выше ${minR}`);
                  setTimeout(() => setLockedMessage(null), 3000);
                  return;
                }
                if (isAuthenticated) {
                  setShowGameSettings(true);
                } else {
                  setShowAuthModal(true);
                }
              }}
            >
              <Icon name="Trophy" className="mr-2" size={24} />
              Участвовать в турнире
              {!isLevelAllowed("level_tournament") && (
                <Icon name="Lock" className="ml-2" size={18} />
              )}
            </Button>
          </div>
        )}
      </div>

      {lockedMessage && (
        <div className="mb-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            <Icon name="Lock" size={16} />
            {lockedMessage}
          </div>
        </div>
      )}

      <h2
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-slate-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-500 dark:to-orange-500 dark:bg-clip-text dark:text-transparent animate-slide-up px-2"
        style={{ animationDelay: "0.1s" }}
      >
        Шахматный мир ждет тебя
      </h2>
      <p
        className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-0 animate-slide-up px-3 sm:px-2"
        style={{ animationDelay: "0.2s" }}
      >
        Играем онлайн с людьми со всей страны. Найдем достойного соперника для
        тебя.
      </p>
    </div>
  );
};

export default HomeActionButtons;