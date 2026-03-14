import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cityRegions } from '@/components/chess/data/cities';

interface ProfileSectionProps {
  stats: {
    games: number;
    wins: number;
    rating: number;
    tournaments: number;
  };
  onLogout?: () => void;
}

export const ProfileSection = ({ stats, onLogout }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    city: '',
    avatar: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    city: '',
    avatar: ''
  });
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      setEditData(user);
    }
  }, []);

  const cities = Object.keys(cityRegions).sort();

  const filteredCities = citySearch 
    ? cities.filter(city => city.toLowerCase().startsWith(citySearch.toLowerCase()))
    : [];

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setEditData({ ...editData, avatar: newAvatar });
        setUserData({ ...userData, avatar: newAvatar });
        const savedUser = localStorage.getItem('chessUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          user.avatar = newAvatar;
          localStorage.setItem('chessUser', JSON.stringify(user));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUserData(editData);
    localStorage.setItem('chessUser', JSON.stringify(editData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setCitySearch('');
    setShowCityDropdown(false);
    setIsEditing(false);
  };

  const handleCitySelect = (city: string) => {
    setEditData({ ...editData, city });
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setCitySearch(editData.city);
  };

  const getInitials = (name: string) => {
    if (!name) return 'ВЫ';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userRegion = cityRegions[editData.city] || cityRegions[userData.city] || userData.city;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-white">Профиль пользователя</CardTitle>
            {!isEditing ? (
              <Button
                onClick={handleEditStart}
                variant="outline"
                className="border-blue-400/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full sm:w-auto"
              >
                <Icon name="Edit" size={18} className="mr-2" />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-slate-200 dark:border-white/20 flex-1 sm:flex-initial"
                >
                  <Icon name="X" size={18} className="mr-2" />
                  Отмена
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-0 flex-1 sm:flex-initial"
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Сохранить
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <div 
                className="relative cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <div className="w-40 h-56 rounded-2xl ring-4 ring-blue-400/50 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {editData.avatar ? (
                    <img src={editData.avatar} alt={editData.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl font-bold text-white">
                      {getInitials(editData.name)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <Icon name="Camera" size={40} className="text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Загрузить фото</p>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Имя и фамилия
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Введите имя и фамилию"
                    />
                  ) : (
                    <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 text-gray-900 dark:text-white">
                      {userData.name || 'Не указано'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Введите email"
                    />
                  ) : (
                    <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 text-gray-900 dark:text-white">
                      {userData.email || 'Не указано'}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Город
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => {
                          setCitySearch(e.target.value);
                          setEditData({ ...editData, city: e.target.value });
                          setShowCityDropdown(true);
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Начните вводить название города"
                      />
                      {showCityDropdown && filteredCities.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg">
                          {filteredCities.slice(0, 10).map((city) => (
                            <div
                              key={city}
                              onClick={() => handleCitySelect(city)}
                              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-gray-900 dark:text-white"
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 text-gray-900 dark:text-white">
                      {userData.city || 'Не указано'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Регион
                  </label>
                  <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 text-gray-600 dark:text-gray-400">
                    {userRegion || 'Не указано'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                  <Icon name="TrendingUp" className="mr-1" size={14} />
                  Рейтинг: {stats.rating}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.games}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Всего партий</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.wins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Побед</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {stats.games > 0 ? Math.round(stats.wins / stats.games * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Винрейт</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.rating}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Рейтинг</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {onLogout && (
        <Button
          onClick={() => {
            if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
              onLogout();
            }
          }}
          variant="outline"
          className="w-full border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-12"
        >
          <Icon name="LogOut" size={18} className="mr-2" />
          Выйти из аккаунта
        </Button>
      )}
    </div>
  );
};