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
    { rank: 1, name: 'Александр Петров', rating: 2456, city: 'Москва', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander' },
    { rank: 2, name: 'Мария Смирнова', rating: 2398, city: 'Санкт-Петербург', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
    { rank: 3, name: 'Дмитрий Иванов', rating: 2356, city: 'Казань', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry' },
    { rank: 4, name: 'Елена Козлова', rating: 2287, city: 'Екатеринбург', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    { rank: 5, name: 'Виктор Федоров', rating: 2245, city: 'Новосибирск', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viktor' },
    { rank: 6, name: 'Анастасия Белова', rating: 2198, city: 'Нижний Новгород', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anastasia' },
    { rank: 7, name: 'Максим Орлов', rating: 2156, city: 'Казань', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maxim' },
    { rank: 8, name: 'Светлана Зайцева', rating: 2134, city: 'Челябинск', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Svetlana' },
    { rank: 9, name: 'Николай Попов', rating: 2098, city: 'Самара', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikolay' },
    { rank: 10, name: 'Екатерина Соколова', rating: 2067, city: 'Ростов-на-Дону', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ekaterina' },
  ];

  const fullRegionRanking = [
    { rank: 1, name: 'Игорь Соколов', rating: 2123, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor' },
    { rank: 2, name: 'Анна Волкова', rating: 2089, city: userCity === 'Москва' ? 'Подольск' : userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
    { rank: 3, name: 'Сергей Новиков', rating: 2045, city: userCity === 'Москва' ? 'Люберцы' : userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey' },
    { rank: 4, name: 'Ольга Морозова', rating: 1998, city: userCity === 'Москва' ? 'Химки' : userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olga' },
    { rank: 5, name: 'Андрей Кузнецов', rating: 1965, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrey' },
    { rank: 6, name: 'Татьяна Лебедева', rating: 1934, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tatiana' },
    { rank: 7, name: 'Владимир Васильев', rating: 1912, city: userCity === 'Москва' ? 'Балашиха' : userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vladimir' },
    { rank: 8, name: 'Юлия Михайлова', rating: 1889, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia' },
    { rank: 9, name: 'Олег Романов', rating: 1867, city: userCity === 'Москва' ? 'Королев' : userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oleg' },
    { rank: 10, name: 'Наталья Григорьева', rating: 1845, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natalya' },
  ];

  const savedUser = localStorage.getItem('chessUser');
  const userAvatar = savedUser ? JSON.parse(savedUser).avatar : '';

  const fullCityRanking = [
    { rank: 1, name: 'Павел Лебедев', rating: 1923, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pavel' },
    { rank: 2, name: 'Наталья Орлова', rating: 1889, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia' },
    { rank: 3, name: 'Артём Федоров', rating: 1856, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Artem' },
    { rank: 4, name: 'Вы', rating: 1842, city: userCity, highlight: true, avatar: userAvatar },
    { rank: 5, name: 'Игорь Петров', rating: 1823, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IgorP' },
    { rank: 6, name: 'Марина Сидорова', rating: 1798, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marina' },
    { rank: 7, name: 'Дмитрий Козлов', rating: 1776, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DmitryK' },
    { rank: 8, name: 'Елена Новикова', rating: 1754, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaN' },
    { rank: 9, name: 'Алексей Морозов', rating: 1732, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey' },
    { rank: 10, name: 'Ольга Волкова', rating: 1710, city: userCity, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OlgaV' },
  ];

  const topRussia = fullRussiaRanking.slice(0, 4);
  const topRegion = fullRegionRanking.slice(0, 4);
  const topCity = fullCityRanking.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center pt-2 pb-12">
        <div className="flex flex-col items-center gap-4 mb-8 animate-slide-up">
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
          
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
              onClick={() => {
                if (isAuthenticated) {
                  setShowGameSettings(true);
                } else {
                  setShowAuthModal(true);
                }
              }}
            >
              <Icon name="Gamepad2" className="mr-2" size={24} />
              Играть офлайн
            </Button>
            
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
              onClick={() => {
                if (isAuthenticated) {
                  setShowGameSettings(true);
                } else {
                  setShowAuthModal(true);
                }
              }}
            >
              <Icon name="Trophy" className="mr-2" size={24} />
              Участвовать в турнире
            </Button>
          </div>
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