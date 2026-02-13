import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface FriendsSectionProps {
  onOpenChat?: (friendName: string, friendRating: number, friendId: string) => void;
}

const SITE_URL = window.location.origin;

export const FriendsSection = ({ onOpenChat }: FriendsSectionProps) => {
  const [userId, setUserId] = useState<string>('');
  const [friendCode, setFriendCode] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

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
      }
    }

    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    if (inviteId) {
      setFriendCode(inviteId);
      setShowAddFriend(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const copyInviteLink = () => {
    const link = `${SITE_URL}?invite=${userId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddFriend = () => {
    const code = friendCode.trim();
    if (!code) return;
    if (code === userId) {
      alert('Нельзя добавить самого себя');
      return;
    }
    if (friends.some(f => f.id === code)) {
      alert('Этот пользователь уже в вашем списке друзей');
      return;
    }
    const newFriend: Friend = {
      id: code,
      name: 'Игрок ' + code.slice(-4),
      rating: 1200,
      city: '',
      status: 'offline'
    };
    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    localStorage.setItem('chessFriends', JSON.stringify(updatedFriends));
    setFriendCode('');
    setShowAddFriend(false);
  };

  const removeFriend = (id: string) => {
    const updatedFriends = friends.filter(f => f.id !== id);
    setFriends(updatedFriends);
    localStorage.setItem('chessFriends', JSON.stringify(updatedFriends));
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
            } catch { /* ignore non-URL QR data */ }
            setFriendCode(code);
            setShowScanner(false);
            setShowAddFriend(true);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch {
        alert('Не удалось запустить камеру. Проверьте разрешения.');
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

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${SITE_URL}?invite=${userId}`)}`;

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 overflow-hidden">
        <CardContent className="p-4 md:p-6 space-y-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-500/20">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
              <Icon name="Fingerprint" size={14} />
              Ваш уникальный ID
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-lg md:text-xl font-mono font-bold text-slate-900 dark:text-white bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-lg tracking-wider">
                {userId}
              </code>
              <Button
                onClick={copyInviteLink}
                variant="outline"
                size="sm"
                className={`border-blue-300 dark:border-blue-500/40 transition-all ${
                  copied
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/40'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <Icon name={copied ? 'Check' : 'Link'} size={14} className="mr-1.5" />
                {copied ? 'Скопировано!' : 'Копировать ссылку'}
              </Button>
            </div>
            <p className="text-[11px] text-blue-500/70 dark:text-blue-400/50 mt-2">
              Отправьте ссылку другу — он перейдёт на сайт и сможет вас добавить
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="ghost"
                size="sm"
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
              >
                <Icon name="QrCode" size={16} className="mr-1.5" />
                {showQR ? 'Скрыть QR' : 'Мой QR-код'}
              </Button>
            </div>

            {showQR && (
              <div className="mt-3 flex justify-center animate-scale-in">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 rounded" />
                  <p className="text-center text-[11px] text-gray-500 mt-2">Друг сканирует — попадает на сайт</p>
                </div>
              </div>
            )}
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
                onClick={() => { setShowAddFriend(!showAddFriend); setShowScanner(false); }}
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
                    onChange={(e) => setFriendCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                    placeholder="Введите ID друга (USER-...)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    autoFocus
                  />
                  <Button
                    onClick={handleAddFriend}
                    disabled={!friendCode.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white border-0"
                  >
                    <Icon name="Plus" size={18} />
                  </Button>
                </div>
              </div>
            )}

            {friends.length === 0 ? (
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
                    className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-11 h-11">
                        {friend.avatar ? (
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                            {getInitials(friend.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{friend.name}</span>
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
                          onClick={() => onOpenChat(friend.name, friend.rating, friend.id)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0"
                          title="Написать"
                        >
                          <Icon name="MessageCircle" size={16} />
                        </Button>
                      )}
                      <Button
                        onClick={() => removeFriend(friend.id)}
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