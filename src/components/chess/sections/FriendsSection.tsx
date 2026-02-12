import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  city: string;
  status: 'online' | 'offline';
}

export const FriendsSection = () => {
  const [userId, setUserId] = useState<string>('');
  const [friendCode, setFriendCode] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (!user.userId) {
        const newUserId = 'USER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        user.userId = newUserId;
        localStorage.setItem('chessUser', JSON.stringify(user));
        setUserId(newUserId);
      } else {
        setUserId(user.userId);
      }

      const savedFriends = localStorage.getItem('chessFriends');
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends));
      } else {
        const mockFriends: Friend[] = [
          { id: 'USER-A1B2C3D', name: 'Александр Петров', rating: 2456, city: 'Москва', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexanderP' },
          { id: 'USER-E4F5G6H', name: 'Мария Смирнова', rating: 2398, city: 'Санкт-Петербург', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaS' },
          { id: 'USER-I7J8K9L', name: 'Дмитрий Иванов', rating: 2356, city: 'Казань', status: 'offline', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DmitryI' },
        ];
        setFriends(mockFriends);
        localStorage.setItem('chessFriends', JSON.stringify(mockFriends));
      }
    }
  }, []);

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    alert('ID скопирован в буфер обмена!');
  };

  const handleAddFriend = () => {
    if (friendCode.trim()) {
      const newFriend: Friend = {
        id: friendCode,
        name: 'Новый друг',
        rating: 1500,
        city: 'Неизвестно',
        status: 'offline'
      };
      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      localStorage.setItem('chessFriends', JSON.stringify(updatedFriends));
      setFriendCode('');
      setShowAddFriend(false);
      alert('Приглашение отправлено!');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userId}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="Users" className="text-blue-600 dark:text-blue-400" size={24} />
            Мои друзья
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ваш уникальный ID</div>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-3 py-1 rounded">
                    {userId}
                  </code>
                  <Button
                    onClick={copyUserId}
                    variant="outline"
                    size="sm"
                    className="border-blue-400/50 text-blue-600 dark:text-blue-400"
                  >
                    <Icon name="Copy" size={16} className="mr-1" />
                    Копировать
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="outline"
                className="border-blue-400/50 text-blue-600 dark:text-blue-400"
              >
                <Icon name="QrCode" size={18} className="mr-2" />
                {showQR ? 'Скрыть QR-код' : 'Показать QR-код'}
              </Button>
            </div>
            
            {showQR && (
              <div className="mt-4 flex justify-center animate-scale-in">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  <p className="text-center text-sm text-gray-600 mt-2">Отсканируйте для добавления в друзья</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Список друзей ({friends.length})
            </h3>
            <Button
              onClick={() => setShowAddFriend(!showAddFriend)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Icon name="UserPlus" size={18} className="mr-2" />
              Добавить друга
            </Button>
          </div>

          {showAddFriend && (
            <div className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 animate-slide-down">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  placeholder="Введите ID друга (например: USER-A1B2C3D)"
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button
                  onClick={handleAddFriend}
                  className="bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  <Icon name="Send" size={18} className="mr-2" />
                  Отправить
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="UserPlus" className="mx-auto mb-4" size={48} />
                <p>У вас пока нет друзей</p>
                <p className="text-sm">Добавьте друзей по их ID или QR-коду</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all"
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      {friend.avatar ? (
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {getInitials(friend.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                      friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{friend.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{friend.city}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                        <Icon name="TrendingUp" className="mr-1" size={12} />
                        {friend.rating}
                      </Badge>
                      <Badge variant="outline" className={friend.status === 'online' ? 'border-green-400/50 text-green-400' : 'border-gray-400/50 text-gray-400'}>
                        {friend.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-400/50 text-blue-600 dark:text-blue-400"
                    >
                      <Icon name="Play" size={16} className="mr-1" />
                      Играть
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 dark:border-white/20"
                    >
                      <Icon name="MessageCircle" size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
