import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const INVITE_URL = 'https://functions.poehali.dev/622400c1-79cc-4391-92fa-9995517f5de6';
const POLL_INTERVAL = 3000;

interface GameInvite {
  id: number;
  from_user_id: string;
  from_username: string;
  from_avatar: string;
  from_rating: number;
  time_control: string;
  color_choice: string;
  created_at: string;
}

const getTimeLabel = (tc: string) => {
  if (tc.includes('+')) {
    const [m, i] = tc.split('+');
    return i === '0' ? `${m} мин` : `${m}+${i}`;
  }
  return tc;
};

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2).toUpperCase();
};

const getUserId = () => {
  const saved = localStorage.getItem('chessUser');
  if (!saved) return '';
  const user = JSON.parse(saved);
  const rawId = user.email || user.name || 'anonymous';
  return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
};

const GameInviteNotification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invite, setInvite] = useState<GameInvite | null>(null);
  const [visible, setVisible] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const declinedRef = useRef<Set<number>>(new Set());

  const isInGame = location.pathname === '/game';

  const poll = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    try {
      const res = await fetch(`${INVITE_URL}?action=poll&user_id=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (data.invite && !declinedRef.current.has(data.invite.id)) {
        setInvite(data.invite);
        setVisible(true);
      }
    } catch { /* network error */ }
  }, []);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [poll]);

  const handleDecline = async () => {
    if (!invite) return;
    const uid = getUserId();
    declinedRef.current.add(invite.id);
    setVisible(false);
    setInvite(null);
    setShowSurrenderConfirm(false);
    try {
      await fetch(INVITE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', invite_id: invite.id, user_id: uid })
      });
    } catch { /* ignore */ }
  };

  const handleAccept = async () => {
    if (isInGame) {
      setShowSurrenderConfirm(true);
      return;
    }
    doAccept();
  };

  const doAccept = async () => {
    if (!invite || accepting) return;
    setAccepting(true);
    const uid = getUserId();

    if (isInGame) {
      localStorage.removeItem('activeGame');
    }

    try {
      const res = await fetch(INVITE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', invite_id: invite.id, user_id: uid })
      });
      const data = await res.json();
      if (data.status === 'accepted' && data.game_id) {
        setVisible(false);
        setInvite(null);
        setShowSurrenderConfirm(false);
        navigate(
          `/game?time=${encodeURIComponent(data.time_control)}&color=${data.player_color}&online_game_id=${data.game_id}&online=true&opponent_name=${encodeURIComponent(data.opponent_name || '')}&opponent_rating=${data.opponent_rating || 0}&opponent_avatar=${encodeURIComponent(data.opponent_avatar || '')}`
        );
      }
    } catch { /* network error */ }
    setAccepting(false);
  };

  if (!visible || !invite) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-sm animate-slide-down">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 flex items-center gap-2">
          <Icon name="Swords" size={18} className="text-white" />
          <span className="text-sm font-bold text-white">Приглашение на игру</span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-green-400">
              {invite.from_avatar ? (
                <AvatarImage src={invite.from_avatar} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {getInitials(invite.from_username)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 dark:text-white truncate">{invite.from_username}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Icon name="Trophy" size={12} className="text-amber-500" />{invite.from_rating}
                </span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={12} />{getTimeLabel(invite.time_control)}
                </span>
              </div>
            </div>
          </div>

          {showSurrenderConfirm ? (
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Текущая партия будет засчитана как поражение. Продолжить?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSurrenderConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={doAccept}
                  disabled={accepting}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {accepting ? 'Подключение...' : 'Сдаться и принять'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="X" size={18} />
                Отклонить
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Icon name="Check" size={18} />
                {accepting ? '...' : 'Принять'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInviteNotification;