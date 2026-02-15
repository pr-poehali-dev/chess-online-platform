import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { cityRegions } from "@/components/chess/data/cities";
import { RankingCard } from "./RankingCard";

import API from "@/config/api";
const SITE_SETTINGS_URL = API.siteSettings;
const GEO_DETECT_URL = API.geoDetect;
const LEADERBOARD_URL = API.leaderboard;

interface SiteSettingsData {
  [key: string]: { value: string; description: string };
}

interface HomeSectionProps {
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
  setShowOfflineGameModal: (value: boolean) => void;
}

export const HomeSection = ({
  isAuthenticated,
  setShowGameSettings,
  setShowAuthModal,
  setShowOfflineGameModal,
}: HomeSectionProps) => {
  const [userCity, setUserCity] = useState<string>("Москва");
  const [userRegion, setUserRegion] = useState<string>("Москва");
  const [showRussiaModal, setShowRussiaModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData | null>(
    null,
  );
  const [userRating, setUserRating] = useState(0);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [realLeaderboard, setRealLeaderboard] = useState<{
    country: Array<{
      rank: number;
      name: string;
      rating: number;
      city: string;
      avatar: string;
    }>;
    region: Array<{
      rank: number;
      name: string;
      rating: number;
      city: string;
      avatar: string;
    }>;
    city: Array<{
      rank: number;
      name: string;
      rating: number;
      city: string;
      avatar: string;
    }>;
  } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("chessUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.city) {
        setUserCity(userData.city);
        const region = cityRegions[userData.city];
        setUserRegion(region || userData.city);
      }
      if (userData.rating) setUserRating(userData.rating);
    } else {
      fetch(GEO_DETECT_URL)
        .then((r) => r.json())
        .then((data) => {
          if (data.city) {
            setUserCity(data.city);
            const region = cityRegions[data.city] || data.region || data.city;
            setUserRegion(region);
            sessionStorage.setItem("detectedCity", data.city);
            sessionStorage.setItem("detectedRegion", region);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetch(SITE_SETTINGS_URL)
      .then((r) => r.json())
      .then((data) => setSiteSettings(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!siteSettings || siteSettings.rankings_mode?.value !== "real") return;
    const params = new URLSearchParams({ city: userCity, region: userRegion });
    fetch(`${LEADERBOARD_URL}?${params}`)
      .then((r) => r.json())
      .then((data) => setRealLeaderboard(data))
      .catch(() => {});
  }, [siteSettings, userCity, userRegion]);

  const isButtonVisible = (btnKey: string) => {
    if (!siteSettings) return true;
    return siteSettings[btnKey]?.value !== "false";
  };

  const isLevelAllowed = (levelKey: string) => {
    if (!siteSettings) return true;
    const minRating = parseInt(siteSettings[levelKey]?.value || "0");
    if (minRating === 0) return true;
    return userRating >= minRating;
  };

  const fullRussiaRanking = [
    {
      rank: 1,
      name: "Евгения Малыхина",
      rating: 2456,
      city: "Москва",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander",
    },
    {
      rank: 2,
      name: "Костя Шапран",
      rating: 2398,
      city: "Санкт-Петербург",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    {
      rank: 3,
      name: "Дмитрий Иванов",
      rating: 2356,
      city: "Казань",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry",
    },
    {
      rank: 4,
      name: "Жена Севрюгин",
      rating: 2287,
      city: "Екатеринбург",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    },
    {
      rank: 5,
      name: "Виктор Федоров",
      rating: 2245,
      city: "Новосибирск",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Viktor",
    },
    {
      rank: 6,
      name: "Анастасия Белова",
      rating: 2198,
      city: "Нижний Новгород",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anastasia",
    },
    {
      rank: 7,
      name: "Максим Орлов",
      rating: 2156,
      city: "Казань",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maxim",
    },
    {
      rank: 8,
      name: "Светлана Зайцева",
      rating: 2134,
      city: "Челябинск",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Svetlana",
    },
    {
      rank: 9,
      name: "Николай Попов",
      rating: 2098,
      city: "Самара",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikolay",
    },
    {
      rank: 10,
      name: "Екатерина Соколова",
      rating: 2067,
      city: "Ростов-на-Дону",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ekaterina",
    },
  ];

  const fullRegionRanking = [
    {
      rank: 1,
      name: "Игорь Соколов",
      rating: 2123,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Igor",
    },
    {
      rank: 2,
      name: "Оля Михалковская",
      rating: 2089,
      city: userCity === "Москва" ? "Подольск" : userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
    },
    {
      rank: 3,
      name: "Сергей Новиков",
      rating: 2045,
      city: userCity === "Москва" ? "Люберцы" : userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey",
    },
    {
      rank: 4,
      name: "Настя Бессонова",
      rating: 1998,
      city: userCity === "Москва" ? "Химки" : userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
    },
    {
      rank: 5,
      name: "Андрей Кузнецов",
      rating: 1965,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andrey",
    },
    {
      rank: 6,
      name: "Татьяна Лебедева",
      rating: 1934,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tatiana",
    },
    {
      rank: 7,
      name: "Владимир Васильев",
      rating: 1912,
      city: userCity === "Москва" ? "Балашиха" : userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vladimir",
    },
    {
      rank: 8,
      name: "Юлия Михайлова",
      rating: 1889,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia",
    },
    {
      rank: 9,
      name: "Олег Романов",
      rating: 1867,
      city: userCity === "Москва" ? "Королев" : userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oleg",
    },
    {
      rank: 10,
      name: "Наталья Григорьева",
      rating: 1845,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalya",
    },
  ];

  const savedUser = localStorage.getItem("chessUser");
  const userAvatar = savedUser ? JSON.parse(savedUser).avatar : "";

  const fullCityRanking = [
    {
      rank: 1,
      name: "Павел Лебедев",
      rating: 1923,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pavel",
    },
    {
      rank: 2,
      name: "Наталья Орлова",
      rating: 1889,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia",
    },
    {
      rank: 3,
      name: "Артём Федоров",
      rating: 1856,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    },
    {
      rank: 4,
      name: "Вы",
      rating: 1842,
      city: userCity,
      highlight: true,
      avatar: userAvatar,
    },
    {
      rank: 5,
      name: "Игорь Петров",
      rating: 1823,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=IgorP",
    },
    {
      rank: 6,
      name: "Марина Сидорова",
      rating: 1798,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina",
    },
    {
      rank: 7,
      name: "Дмитрий Козлов",
      rating: 1776,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DmitryK",
    },
    {
      rank: 8,
      name: "Елена Новикова",
      rating: 1754,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaN",
    },
    {
      rank: 9,
      name: "Алексей Морозов",
      rating: 1732,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey",
    },
    {
      rank: 10,
      name: "Ольга Волкова",
      rating: 1710,
      city: userCity,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=OlgaV",
    },
  ];

  const isRealMode =
    siteSettings?.rankings_mode?.value === "real" && realLeaderboard;

  const activeRussiaRanking = isRealMode
    ? realLeaderboard.country
    : fullRussiaRanking;
  const activeRegionRanking = isRealMode
    ? realLeaderboard.region
    : fullRegionRanking;
  const activeCityRanking = isRealMode ? realLeaderboard.city : fullCityRanking;

  const topRussia = activeRussiaRanking.slice(0, 4);
  const topRegion = activeRegionRanking.slice(0, 4);
  const topCity = activeCityRanking.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in overflow-hidden">
      <div className="text-center pt-2 pb-0">
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-slide-up max-w-md mx-auto px-1">
          {isButtonVisible("btn_play_online") && (
            <div className="w-full relative">
              <Button
                size="lg"
                className={`w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-0 px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl transition-all shadow-lg ${!isLevelAllowed("level_play_online") ? "opacity-60 cursor-not-allowed hover:scale-100" : "hover:scale-105"}`}
                onClick={() => {
                  if (!isLevelAllowed("level_play_online")) {
                    const minR = siteSettings?.level_play_online?.value || "0";
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
                <Icon name="Play" className="mr-2" size={24} />
                Играть онлайн
                {!isLevelAllowed("level_play_online") && (
                  <Icon name="Lock" className="ml-2" size={18} />
                )}
              </Button>
            </div>
          )}

          {isButtonVisible("btn_play_offline") && (
            <div className="w-full relative">
              <Button
                size="lg"
                className={`w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-0 px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl transition-all shadow-lg ${!isLevelAllowed("level_play_offline") ? "opacity-60 cursor-not-allowed hover:scale-100" : "hover:scale-105"}`}
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
                className={`w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white border-0 px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl transition-all shadow-lg ${!isLevelAllowed("level_tournament") ? "opacity-60 cursor-not-allowed hover:scale-100" : "hover:scale-105"}`}
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
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-slate-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-500 dark:to-orange-500 dark:bg-clip-text dark:text-transparent animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Шахматный мир ждет тебя
        </h2>
        <p
          className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-0 animate-slide-up px-2"
          style={{ animationDelay: "0.2s" }}
        >
          Играем онлайн с людьми со всей страны. Найдем достойного соперника для
          тебя.
        </p>
      </div>

      {isButtonVisible("btn_rankings") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <RankingCard
            title="Лучшие в России"
            subtitle="Лидеры страны"
            icon="Globe"
            iconColor="blue"
            topPlayers={topRussia}
            fullRanking={activeRussiaRanking}
            showModal={showRussiaModal}
            setShowModal={setShowRussiaModal}
            animationDelay="0s"
          />

          <RankingCard
            title="Первые в регионе"
            subtitle={userRegion}
            icon="Map"
            iconColor="purple"
            topPlayers={topRegion}
            fullRanking={activeRegionRanking}
            showModal={showRegionModal}
            setShowModal={setShowRegionModal}
            animationDelay="0.1s"
          />

          <RankingCard
            title="Победители в городе"
            subtitle={userCity}
            icon="Home"
            iconColor="orange"
            topPlayers={topCity}
            fullRanking={activeCityRanking}
            showModal={showCityModal}
            setShowModal={setShowCityModal}
            animationDelay="0.2s"
          />
        </div>
      )}
    </div>
  );
};
