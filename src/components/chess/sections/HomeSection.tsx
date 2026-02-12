import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cityRegions } from '@/components/chess/data/cities';
import { RankingCard } from './RankingCard';

interface HomeSectionProps {
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
}

export const HomeSection = ({ 
  isAuthenticated, 
  setShowGameSettings, 
  setShowAuthModal
}: HomeSectionProps) => {
  const [userCity, setUserCity] = useState<string>('Москва');
  const [userRegion, setUserRegion] = useState<string>('Москва');
  const [showRussiaModal, setShowRussiaModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.city) {
        setUserCity(userData.city);
        const region = cityRegions[userData.city];
        setUserRegion(region || userData.city);
      }
    }
  }, []);

  const fullRussiaRanking = [
    { rank: 1, name: 'Александр Петров', rating: 2456, city: 'Москва' },
    { rank: 2, name: 'Мария Смирнова', rating: 2398, city: 'Санкт-Петербург' },
    { rank: 3, name: 'Дмитрий Иванов', rating: 2356, city: 'Казань' },
    { rank: 4, name: 'Елена Козлова', rating: 2287, city: 'Екатеринбург' },
    { rank: 5, name: 'Виктор Федоров', rating: 2245, city: 'Новосибирск' },
    { rank: 6, name: 'Анастасия Белова', rating: 2198, city: 'Нижний Новгород' },
    { rank: 7, name: 'Максим Орлов', rating: 2156, city: 'Казань' },
    { rank: 8, name: 'Светлана Зайцева', rating: 2134, city: 'Челябинск' },
    { rank: 9, name: 'Николай Попов', rating: 2098, city: 'Самара' },
    { rank: 10, name: 'Екатерина Соколова', rating: 2067, city: 'Ростов-на-Дону' },
  ];

  const fullRegionRanking = [
    { rank: 1, name: 'Игорь Соколов', rating: 2123, city: userCity },
    { rank: 2, name: 'Анна Волкова', rating: 2089, city: userCity === 'Москва' ? 'Подольск' : userCity },
    { rank: 3, name: 'Сергей Новиков', rating: 2045, city: userCity === 'Москва' ? 'Люберцы' : userCity },
    { rank: 4, name: 'Ольга Морозова', rating: 1998, city: userCity === 'Москва' ? 'Химки' : userCity },
    { rank: 5, name: 'Андрей Кузнецов', rating: 1965, city: userCity },
    { rank: 6, name: 'Татьяна Лебедева', rating: 1934, city: userCity },
    { rank: 7, name: 'Владимир Васильев', rating: 1912, city: userCity === 'Москва' ? 'Балашиха' : userCity },
    { rank: 8, name: 'Юлия Михайлова', rating: 1889, city: userCity },
    { rank: 9, name: 'Олег Романов', rating: 1867, city: userCity === 'Москва' ? 'Королев' : userCity },
    { rank: 10, name: 'Наталья Григорьева', rating: 1845, city: userCity },
  ];

  const fullCityRanking = [
    { rank: 1, name: 'Павел Лебедев', rating: 1923, city: userCity },
    { rank: 2, name: 'Наталья Орлова', rating: 1889, city: userCity },
    { rank: 3, name: 'Артём Федоров', rating: 1856, city: userCity },
    { rank: 4, name: 'Вы', rating: 1842, city: userCity, highlight: true },
    { rank: 5, name: 'Игорь Петров', rating: 1823, city: userCity },
    { rank: 6, name: 'Марина Сидорова', rating: 1798, city: userCity },
    { rank: 7, name: 'Дмитрий Козлов', rating: 1776, city: userCity },
    { rank: 8, name: 'Елена Новикова', rating: 1754, city: userCity },
    { rank: 9, name: 'Алексей Морозов', rating: 1732, city: userCity },
    { rank: 10, name: 'Ольга Волкова', rating: 1710, city: userCity },
  ];

  const topRussia = fullRussiaRanking.slice(0, 4);
  const topRegion = fullRegionRanking.slice(0, 4);
  const topCity = fullCityRanking.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center pt-2 pb-12">
        <div className="flex justify-center mb-8 animate-slide-up">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-0 px-12 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
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
        <h2 className="text-5xl font-bold mb-4 text-slate-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-500 dark:to-orange-500 dark:bg-clip-text dark:text-transparent animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Играйте в шахматы онлайн
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Соревнуйтесь с игроками со всего мира или бросьте вызов компьютеру
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <RankingCard
          title="Лучшие в России"
          subtitle="Лидеры страны"
          icon="Globe"
          iconColor="blue"
          topPlayers={topRussia}
          fullRanking={fullRussiaRanking}
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
          fullRanking={fullRegionRanking}
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
          fullRanking={fullCityRanking}
          showModal={showCityModal}
          setShowModal={setShowCityModal}
          animationDelay="0.2s"
        />
      </div>
    </div>
  );
};