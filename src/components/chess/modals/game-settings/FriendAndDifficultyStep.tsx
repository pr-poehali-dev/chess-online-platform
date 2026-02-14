import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

import API from '@/config/api';
const FRIENDS_URL = API.friends;

interface RealFriend {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  city: string;
  status: 'online' | 'offline';
  user_code: string;
}

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2).toUpperCase();
};

interface FriendAndDifficultyStepProps {
  selectedOpponent: 'city' | 'region' | 'country' | 'friend' | 'computer' | null;
  onFriendSelect: (friendId: string, friendName: string, friendRating: number, friendAvatar: string) => void;
  onDifficultySelect: (difficulty: 'easy' | 'medium' | 'hard' | 'master') => void;
}

const difficulties = [
  { key: 'easy' as const, emoji: '🟢', label: 'Легкий', desc: 'Рейтинг: 800-1000 • Для начинающих' },
  { key: 'medium' as const, emoji: '🟡', label: 'Средний', desc: 'Рейтинг: 1200-1500 • Любители' },
  { key: 'hard' as const, emoji: '🟠', label: 'Сложный', desc: 'Рейтинг: 1800-2000 • Опытные' },
  { key: 'master' as const, emoji: '🔴', label: 'Мастер', desc: 'Рейтинг: 2200+ • Для профессионалов' },
];

const FriendAndDifficultyStep = ({
  selectedOpponent,
  onFriendSelect,
  onDifficultySelect,
}: FriendAndDifficultyStepProps) => {
  const [friends, setFriends] = useState<RealFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserId = useCallback(() => {
    const saved = localStorage.getItem('chessUser');
    if (!saved) return '';
    const user = JSON.parse(saved);
    const rawId = user.email || user.name || 'anonymous';
    return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
  }, []);

  useEffect(() => {
    if (selectedOpponent !== 'friend') return;
    const uid = getUserId();
    if (!uid) { setLoading(false); return; }

    fetch(`${FRIENDS_URL}?action=list&user_id=${encodeURIComponent(uid)}`)
      .then(r => r.json())
      .then(data => setFriends(data.friends || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${FRIENDS_URL}?action=heartbeat&user_id=${encodeURIComponent(uid)}`).catch(() => {});
  }, [selectedOpponent, getUserId]);

  if (selectedOpponent === 'friend') {
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Выберите друга для игры
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-400">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Загрузка друзей...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <Icon name="Users" className="mx-auto mb-3 opacity-40" size={44} />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Нет друзей</p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Добавьте друзей в разделе «Друзья»</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => onFriendSelect(friend.id, friend.username, friend.rating, friend.avatar)}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10 sm:w-11 sm:h-11">
                    {friend.avatar ? <AvatarImage src={friend.avatar} alt={friend.username} /> : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs sm:text-sm">{getInitials(friend.username)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{friend.username}</span>
                    <Badge variant={friend.status === 'online' ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 flex-shrink-0 ${
                      friend.status === 'online' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {friend.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                    </Badge>
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Icon name="Trophy" size={11} className="text-amber-500" />{friend.rating}</span>
                    {friend.city && <span className="flex items-center gap-1 truncate"><Icon name="MapPin" size={11} className="flex-shrink-0" />{friend.city}</span>}
                  </div>
                </div>
                <Icon name="Swords" size={18} className="text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedOpponent === 'computer') {
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Выберите уровень сложности
        </div>
        {difficulties.map((d) => (
          <Button
            key={d.key}
            className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
            onClick={() => onDifficultySelect(d.key)}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{d.emoji}</div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{d.label}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">{d.desc}</div>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-slate-400" />
          </Button>
        ))}
      </div>
    );
  }

  return null;
};

export default FriendAndDifficultyStep;