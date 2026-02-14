import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const FRIENDS_URL = 'https://functions.poehali.dev/5ffb6c1a-2221-4a90-943a-b29a0a4b9700';
const SITE_URL = window.location.origin;

interface Friend {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  city: string;
  status: 'online' | 'offline';
  user_code: string;
}

interface FriendGame {
  id: number;
  opponent_name: string;
  opponent_type: string;
  opponent_rating: number | null;
  result: 'win' | 'loss' | 'draw';
  user_color: string;
  time_control: string;
  difficulty: string | null;
  moves_count: number;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  duration_seconds: number | null;
  end_reason: string;
  created_at: string;
}

interface FriendProfile {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  city: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  last_online: string | null;
}

interface FriendsSectionProps {
  onOpenChat?: (friendName: string, friendRating: number, friendId: string) => void;
  pendingInviteCode?: string | null;
  onInviteProcessed?: () => void;
}

export const FriendsSection = ({ onOpenChat, pendingInviteCode, onInviteProcessed }: FriendsSectionProps) => {
  const [userId, setUserId] = useState('');
  const [userCode, setUserCode] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCode, setFriendCode] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [friendGames, setFriendGames] = useState<FriendGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const getUserId = useCallback(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return '';
    const user = JSON.parse(savedUser);
    const rawId = user.email || user.name || 'anonymous';
    return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
  }, []);

  const fetchMyCode = useCallback(async (uid: string) => {
    const res = await fetch(`${FRIENDS_URL}?action=my_code&user_id=${encodeURIComponent(uid)}`);
    const data = await res.json();
    if (data.code) {
      setUserCode(data.code);
      const savedUser = localStorage.getItem('chessUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        user.userId = data.code;
        localStorage.setItem('chessUser', JSON.stringify(user));
      }
    }
  }, []);

  const fetchFriends = useCallback(async (uid: string) => {
    const res = await fetch(`${FRIENDS_URL}?action=list&user_id=${encodeURIComponent(uid)}`);
    const data = await res.json();
    setFriends(data.friends || []);
    setLoading(false);
  }, []);

  const sendHeartbeat = useCallback(async (uid: string) => {
    fetch(`${FRIENDS_URL}?action=heartbeat&user_id=${encodeURIComponent(uid)}`).catch(() => {});
  }, []);

  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;
    setUserId(uid);
    fetchMyCode(uid);
    fetchFriends(uid);
    sendHeartbeat(uid);

    const heartbeatInterval = setInterval(() => sendHeartbeat(uid), 60000);
    const refreshInterval = setInterval(() => fetchFriends(uid), 30000);
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(refreshInterval);
    };
  }, [getUserId, fetchMyCode, fetchFriends, sendHeartbeat]);

  useEffect(() => {
    if (pendingInviteCode && userId) {
      setFriendCode(pendingInviteCode);
      setShowAddFriend(true);
      handleAddFriendByCode(pendingInviteCode);
      if (onInviteProcessed) onInviteProcessed();
    }
  }, [pendingInviteCode, userId]);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const copyInviteLink = () => {
    const link = `${SITE_URL}?invite=${userCode}`;
    const doCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(doCopy).catch(() => {
        fallbackCopy(link);
        doCopy();
      });
    } else {
      fallbackCopy(link);
      doCopy();
    }
  };

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  const handleAddFriendByCode = async (code?: string) => {
    const codeToAdd = (code || friendCode).trim();
    if (!codeToAdd) return;
    setAddError('');
    setAddSuccess('');

    try {
      const res = await fetch(FRIENDS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', user_id: userId, friend_code: codeToAdd })
      });
      const data = await res.json();
      if (res.ok && data.status === 'added') {
        setAddSuccess(`${data.friend.username} добавлен в друзья!`);
        setFriendCode('');
        fetchFriends(userId);
        setTimeout(() => { setAddSuccess(''); setShowAddFriend(false); }, 2000);
      } else {
        if (data.error === 'Already friends') setAddError('Уже в списке друзей');
        else if (data.error === 'User not found') setAddError('Пользователь не найден');
        else if (data.error === 'Cannot add yourself') setAddError('Нельзя добавить себя');
        else setAddError(data.error || 'Ошибка');
      }
    } catch {
      setAddError('Ошибка сети');
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm('Удалить из друзей?')) return;
    await fetch(FRIENDS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', user_id: userId, friend_id: friendId })
    });
    fetchFriends(userId);
  };

  const openFriendProfile = async (friend: Friend) => {
    setLoadingGames(true);
    setSelectedFriend(null);
    setFriendGames([]);

    const [profileRes, gamesRes] = await Promise.all([
      fetch(`${FRIENDS_URL}?action=profile&user_id=${userId}&friend_id=${encodeURIComponent(friend.id)}`),
      fetch(`${FRIENDS_URL}?action=friend_games&user_id=${userId}&friend_id=${encodeURIComponent(friend.id)}`)
    ]);
    const profileData = await profileRes.json();
    const gamesData = await gamesRes.json();

    setSelectedFriend(profileData.user || null);
    setFriendGames(gamesData.games || []);
    setLoadingGames(false);
  };

  const startScanner = async () => {
    setShowScanner(true);
    setTimeout(async () => {
      if (!scannerRef.current) return;
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode(scannerRef.current.id);
        html5QrCodeRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            let code = decodedText;
            try {
              const url = new URL(decodedText);
              const invite = url.searchParams.get('invite');
              if (invite) code = invite;
            } catch { /* not a URL */ }
            setFriendCode(code);
            setShowScanner(false);
            setShowAddFriend(true);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch {
        alert('Не удалось запустить камеру.');
        setShowScanner(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
    }
    setShowScanner(false);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  };

  const qrCodeUrl = userCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${SITE_URL}?invite=${userCode}`)}`
    : '';

  const getResultColor = (result: string) => {
    if (result === 'win') return 'text-green-600 dark:text-green-400';
    if (result === 'loss') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getResultText = (result: string) => {
    if (result === 'win') return 'Победа';
    if (result === 'loss') return 'Поражение';
    return 'Ничья';
  };

  const getEndReasonText = (reason: string) => {
    const map: Record<string, string> = {
      checkmate: 'Мат', stalemate: 'Пат', draw: 'Ничья',
      surrender: 'Сдача', timeout: 'Время'
    };
    return map[reason] || reason;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'Сегодня';
    if (diff === 1) return 'Вчера';
    if (diff < 7) return `${diff} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (selectedFriend) {
    return (
      <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardContent className="p-4 md:p-6">
            <Button
              onClick={() => { setSelectedFriend(null); setFriendGames([]); }}
              variant="ghost"
              className="mb-4 text-blue-600 dark:text-blue-400"
            >
              <Icon name="ChevronLeft" size={18} className="mr-1" />
              Назад к друзьям
            </Button>

            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                {selectedFriend.avatar ? (
                  <AvatarImage src={selectedFriend.avatar} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                    {getInitials(selectedFriend.username)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedFriend.username}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Icon name="Trophy" size={14} className="text-amber-500" />
                    {selectedFriend.rating}
                  </span>
                  {selectedFriend.city && (
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={14} />
                      {selectedFriend.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedFriend.games_played}</div>
                <div className="text-[10px] text-gray-500">Игр</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{selectedFriend.wins}</div>
                <div className="text-[10px] text-gray-500">Побед</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{selectedFriend.losses}</div>
                <div className="text-[10px] text-gray-500">Поражений</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{selectedFriend.draws}</div>
                <div className="text-[10px] text-gray-500">Ничьих</div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Icon name="History" size={18} className="text-blue-600 dark:text-blue-400" />
              История игр
            </h3>

            {loadingGames ? (
              <div className="text-center py-8 text-gray-400">
                <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
                Загрузка...
              </div>
            ) : friendGames.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Icon name="GamepadIcon" size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Нет сыгранных партий</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friendGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${getResultColor(game.result)}`}>
                          {getResultText(game.result)}
                        </span>
                        <span className="text-xs text-gray-500">vs {game.opponent_name}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {game.time_control} · {getEndReasonText(game.end_reason)} · {game.moves_count} ходов
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold ${game.rating_change > 0 ? 'text-green-500' : game.rating_change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {game.rating_change > 0 ? '+' : ''}{game.rating_change}
                      </div>
                      <div className="text-[10px] text-gray-500">{formatDate(game.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 overflow-hidden">
        <CardContent className="p-4 md:p-6 space-y-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
                  <Icon name="Fingerprint" size={14} />
                  Ваш уникальный ID
                </div>
                <button
                  onClick={copyInviteLink}
                  className="group flex items-center gap-2 cursor-pointer"
                  title="Нажмите, чтобы скопировать ссылку"
                >
                  <code className="text-lg md:text-xl font-mono font-bold text-slate-900 dark:text-white bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-lg tracking-wider group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-active:scale-95 transition-all">
                    {userCode || '...'}
                  </code>
                  <span className={`text-xs transition-all ${copied ? 'text-green-500' : 'text-blue-400 opacity-0 group-hover:opacity-100'}`}>
                    {copied ? (
                      <span className="flex items-center gap-1"><Icon name="Check" size={14} /> Скопировано!</span>
                    ) : (
                      <Icon name="Copy" size={14} />
                    )}
                  </span>
                </button>
                <p className="text-[11px] text-blue-500/70 dark:text-blue-400/50 mt-1.5">
                  Нажмите на ID — скопируется ссылка-приглашение
                </p>
              </div>
              {qrCodeUrl && (
                <div className="flex-shrink-0 bg-white rounded-lg p-1.5 shadow-sm">
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
                Мои друзья
                {friends.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({friends.length})</span>
                )}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button
                onClick={() => { setShowAddFriend(!showAddFriend); setShowScanner(false); setAddError(''); setAddSuccess(''); }}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 flex-1 sm:flex-none"
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Ввести ID друга
              </Button>
              {isMobile && (
                <Button
                  onClick={showScanner ? stopScanner : startScanner}
                  variant="outline"
                  className="border-blue-300 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 flex-1 sm:flex-none"
                >
                  <Icon name={showScanner ? 'X' : 'ScanLine'} size={18} className="mr-2" />
                  {showScanner ? 'Закрыть сканер' : 'Сканировать QR'}
                </Button>
              )}
            </div>

            {showScanner && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 animate-scale-in">
                <div id="qr-scanner-region" ref={scannerRef} className="w-full" />
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                  Наведите камеру на QR-код друга
                </p>
              </div>
            )}

            {showAddFriend && (
              <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 animate-scale-in">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={friendCode}
                    onChange={(e) => { setFriendCode(e.target.value); setAddError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFriendByCode()}
                    placeholder="Введите ID друга (USER-...)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleAddFriendByCode()}
                    disabled={!friendCode.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white border-0"
                  >
                    <Icon name="Plus" size={18} />
                  </Button>
                </div>
                {addError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} /> {addError}
                  </p>
                )}
                {addSuccess && (
                  <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                    <Icon name="Check" size={12} /> {addSuccess}
                  </p>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-10 text-gray-400">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Загрузка...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <Icon name="Users" className="mx-auto mb-3 opacity-40" size={44} />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Пока нет друзей</p>
                <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Добавьте друзей по ID или отправьте им ссылку</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => openFriendProfile(friend)}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-11 h-11">
                        {friend.avatar ? (
                          <AvatarImage src={friend.avatar} alt={friend.username} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                            {getInitials(friend.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{friend.username}</span>
                        <Badge variant={friend.status === 'online' ? 'default' : 'secondary'} className={`text-[10px] px-1.5 py-0 ${
                          friend.status === 'online'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {friend.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Icon name="Trophy" size={11} className="text-amber-500" />
                          {friend.rating}
                        </span>
                        {friend.city && (
                          <span className="flex items-center gap-1">
                            <Icon name="MapPin" size={11} />
                            {friend.city}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onOpenChat && (
                        <Button
                          onClick={(e) => { e.stopPropagation(); onOpenChat(friend.username, friend.rating, friend.id); }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0"
                          title="Написать"
                        >
                          <Icon name="MessageCircle" size={16} />
                        </Button>
                      )}
                      <Button
                        onClick={(e) => { e.stopPropagation(); removeFriend(friend.id); }}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Удалить из друзей"
                      >
                        <Icon name="UserMinus" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};