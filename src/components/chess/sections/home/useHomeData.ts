import { useState, useEffect } from "react";
import { cityRegions } from "@/components/chess/data/cities";
import API from "@/config/api";

const SITE_SETTINGS_URL = API.siteSettings;
const GEO_DETECT_URL = API.geoDetect;
const LEADERBOARD_URL = API.leaderboard;

export interface SiteSettingsData {
  [key: string]: { value: string; description: string };
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  rating: number;
  city: string;
  avatar: string;
  highlight?: boolean;
}

export interface LeaderboardData {
  country: LeaderboardPlayer[];
  region: LeaderboardPlayer[];
  city: LeaderboardPlayer[];
}

const fullRussiaRanking: LeaderboardPlayer[] = [
  {
    rank: 1,
    name: "Евгения Малыхина",
    rating: 2456,
    city: "Москва",
    avatar: "",
  },
  {
    rank: 2,
    name: "Костя Шапран",
    rating: 2398,
    city: "Санкт-Петербург",
    avatar: "",
  },
  {
    rank: 3,
    name: "Владик Гурин",
    rating: 2356,
    city: "Казань",
    avatar: "",
  },
  {
    rank: 4,
    name: "Женя Севрюгин",
    rating: 2287,
    city: "Екатеринбург",
    avatar: "",
  },
  {
    rank: 5,
    name: "Виктор Федоров",
    rating: 2245,
    city: "Новосибирск",
    avatar: "",
  },
  {
    rank: 6,
    name: "Анастасия Белова",
    rating: 2198,
    city: "Нижний Новгород",
    avatar: "",
  },
  {
    rank: 7,
    name: "Максим Орлов",
    rating: 2156,
    city: "Казань",
    avatar: "",
  },
  {
    rank: 8,
    name: "Светлана Зайцева",
    rating: 2134,
    city: "Челябинск",
    avatar: "",
  },
  {
    rank: 9,
    name: "Николай Попов",
    rating: 2098,
    city: "Самара",
    avatar: "",
  },
  {
    rank: 10,
    name: "Екатерина Соколова",
    rating: 2067,
    city: "Ростов-на-Дону",
    avatar: "",
  },
];

function buildRegionRanking(userCity: string): LeaderboardPlayer[] {
  return [
    {
      rank: 1,
      name: "Юлька Акапулька",
      rating: 2123,
      city: userCity,
      avatar: "",
    },
    {
      rank: 2,
      name: "Оля Михалковская",
      rating: 2089,
      city: userCity === "Москва" ? "Подольск" : userCity,
      avatar: "",
    },
    {
      rank: 3,
      name: "Сергей Новиков",
      rating: 2045,
      city: userCity === "Москва" ? "Люберцы" : userCity,
      avatar: "",
    },
    {
      rank: 4,
      name: "Настя Бессонова",
      rating: 1998,
      city: userCity === "Москва" ? "Химки" : userCity,
      avatar: "",
    },
    {
      rank: 5,
      name: "Андрей Кузнецов",
      rating: 1965,
      city: userCity,
      avatar: "",
    },
    {
      rank: 6,
      name: "Татьяна Лебедева",
      rating: 1934,
      city: userCity,
      avatar: "",
    },
    {
      rank: 7,
      name: "Владимир Васильев",
      rating: 1912,
      city: userCity === "Москва" ? "Балашиха" : userCity,
      avatar: "",
    },
    {
      rank: 8,
      name: "Юлия Михайлова",
      rating: 1889,
      city: userCity,
      avatar: "",
    },
    {
      rank: 9,
      name: "Олег Романов",
      rating: 1867,
      city: userCity === "Москва" ? "Королев" : userCity,
      avatar: "",
    },
    {
      rank: 10,
      name: "Наталья Григорьева",
      rating: 1845,
      city: userCity,
      avatar: "",
    },
  ];
}

function buildCityRanking(
  userCity: string,
  userAvatar: string,
): LeaderboardPlayer[] {
  return [
    {
      rank: 1,
      name: "Павел Лебедев",
      rating: 1923,
      city: userCity,
      avatar: "",
    },
    {
      rank: 2,
      name: "Наталья Орлова",
      rating: 1889,
      city: userCity,
      avatar: "",
    },
    {
      rank: 3,
      name: "Артём Федоров",
      rating: 1856,
      city: userCity,
      avatar: "",
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
      avatar: "",
    },
    {
      rank: 6,
      name: "Марина Сидорова",
      rating: 1798,
      city: userCity,
      avatar: "",
    },
    {
      rank: 7,
      name: "Дмитрий Козлов",
      rating: 1776,
      city: userCity,
      avatar: "",
    },
    {
      rank: 8,
      name: "Елена Новикова",
      rating: 1754,
      city: userCity,
      avatar: "",
    },
    {
      rank: 9,
      name: "Алексей Морозов",
      rating: 1732,
      city: userCity,
      avatar: "",
    },
    {
      rank: 10,
      name: "Ольга Волкова",
      rating: 1710,
      city: userCity,
      avatar: "",
    },
  ];
}

export function useHomeData() {
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
  const [realLeaderboard, setRealLeaderboard] =
    useState<LeaderboardData | null>(null);

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
    const CACHE_KEY = "site_settings_cache";
    const CACHE_TTL = 5_000;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_TTL) {
          setSiteSettings(cached.data);
          return;
        }
      }
    } catch { /* ignore */ }
    fetch(SITE_SETTINGS_URL)
      .then((r) => r.json())
      .then((data) => {
        setSiteSettings(data);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch { /* ignore */ }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!siteSettings || siteSettings.rankings_mode?.value !== "real") return;
    const cacheKey = `leaderboard_${userCity}_${userRegion}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const d = JSON.parse(cached);
        if (Date.now() - d.ts < 30 * 60 * 1000) {
          setRealLeaderboard(d.data);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    const params = new URLSearchParams({ city: userCity, region: userRegion });
    fetch(`${LEADERBOARD_URL}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRealLeaderboard(data);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data, ts: Date.now() }),
          );
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
  }, [siteSettings, userCity, userRegion]);

  const isButtonVisible = (btnKey: string) => {
    if (!siteSettings) return ["btn_play_online", "btn_play_friend", "btn_play_computer", "btn_rankings"].includes(btnKey);
    return siteSettings[btnKey]?.value !== "false";
  };

  const isLevelAllowed = (levelKey: string) => {
    if (!siteSettings) return true;
    const minRating = parseInt(siteSettings[levelKey]?.value || "0");
    if (minRating === 0) return true;
    return userRating >= minRating;
  };

  const savedUser = localStorage.getItem("chessUser");
  const userAvatar = savedUser ? JSON.parse(savedUser).avatar : "";

  const isRealMode =
    siteSettings?.rankings_mode?.value === "real" && realLeaderboard;

  const activeRussiaRanking = isRealMode
    ? realLeaderboard.country
    : fullRussiaRanking;
  const activeRegionRanking = isRealMode
    ? realLeaderboard.region
    : buildRegionRanking(userCity);
  const activeCityRanking = isRealMode
    ? realLeaderboard.city
    : buildCityRanking(userCity, userAvatar);

  const topRussia = activeRussiaRanking.slice(0, 4);
  const topRegion = activeRegionRanking.slice(0, 4);
  const topCity = activeCityRanking.slice(0, 4);

  return {
    userCity,
    userRegion,
    siteSettings,
    lockedMessage,
    setLockedMessage,
    isButtonVisible,
    isLevelAllowed,
    showRussiaModal,
    setShowRussiaModal,
    showRegionModal,
    setShowRegionModal,
    showCityModal,
    setShowCityModal,
    topRussia,
    topRegion,
    topCity,
    activeRussiaRanking,
    activeRegionRanking,
    activeCityRanking,
  };
}