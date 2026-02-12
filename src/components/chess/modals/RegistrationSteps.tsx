import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { popularCities, allCities, cityRegions } from '@/components/chess/data/cities';

interface NameStepProps {
  userName: string;
  setUserName: (value: string) => void;
  handleNextStep: () => void;
}

export const NameStep = ({ userName, setUserName, handleNextStep }: NameStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          name="name"
          placeholder="Введите ваше имя"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
          autoComplete="name"
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
          Пожалуйста, указывайте своё настоящее имя
        </p>
      </div>
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={!userName.trim()}
      >
        Продолжить
        <Icon name="ChevronRight" className="ml-2" size={20} />
      </Button>
    </div>
  );
};

interface EmailStepProps {
  userEmail: string;
  setUserEmail: (value: string) => void;
  handleNextStep: () => void;
}

export const EmailStep = ({ userEmail, setUserEmail, handleNextStep }: EmailStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="email"
          name="email"
          placeholder="example@mail.ru"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
          autoComplete="email"
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
          Мы отправим одноразовый пароль для входа
        </p>
      </div>
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={!userEmail.trim() || !userEmail.includes('@')}
      >
        Продолжить
        <Icon name="ChevronRight" className="ml-2" size={20} />
      </Button>
    </div>
  );
};

interface CityStepProps {
  citySearch: string;
  setCitySearch: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  showCityDropdown: boolean;
  setShowCityDropdown: (value: boolean) => void;
  handleNextStep: () => void;
}

export const CityStep = ({
  citySearch,
  setCitySearch,
  selectedCity,
  setSelectedCity,
  showCityDropdown,
  setShowCityDropdown,
  handleNextStep,
}: CityStepProps) => {
  const [showAll] = useState(false);
  
  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/ё/g, 'е');
  };
  
  const search = normalizeText(citySearch.trim());
  
  const filteredCities = search === '' 
    ? popularCities.slice(0, 20)
    : allCities.filter(city => normalizeText(city).includes(search));

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Начните вводить название города"
          value={selectedCity || citySearch}
          onChange={(e) => {
            setCitySearch(e.target.value);
            setSelectedCity('');
            setShowCityDropdown(true);
          }}
          onFocus={() => setShowCityDropdown(true)}
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {showCityDropdown && (
          <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg">
            {filteredCities.length > 0 ? (
              filteredCities.slice(0, 20).map((city) => (
                <div
                  key={city}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => {
                    setSelectedCity(city);
                    setCitySearch('');
                    setShowCityDropdown(false);
                  }}
                >
                  <div className="text-gray-900 dark:text-white font-medium">{city}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{cityRegions[city]}</div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                Город не найден
              </div>
            )}
          </div>
        )}
      </div>
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={!selectedCity}
      >
        Завершить регистрацию
        <Icon name="Check" className="ml-2" size={20} />
      </Button>
    </div>
  );
};