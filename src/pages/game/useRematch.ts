import { useState, useRef, useEffect, useCallback } from 'react';
import API from '@/config/api';

interface UseRematchOptions {
  isOnline: boolean;
  opponentUserId?: string;
  timeControl: string;
  playerColor: 'white' | 'black';
  opponentName: string;
  opponentRating?: number;
  opponentAvatar: string;
  myUserId: string;
  handleOfferRematch: (toUserId?: string, timeControl?: string) => Promise<{ error?: string; inviteId?: number }>;
}

export const useRematch = ({
  isOnline,
  opponentUserId,
  timeControl,
  playerColor,
  opponentName,
  opponentRating,
  opponentAvatar,
  myUserId,
  handleOfferRematch,
}: UseRematchOptions) => {
  const [rematchSent, setRematchSent] = useState(false);
  const [rematchCooldown, setRematchCooldown] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPoll = useCallback((inviteId: number) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API.inviteGame}?action=check_accepted&invite_id=${inviteId}&user_id=${encodeURIComponent(myUserId)}`);
        const data = await res.json();
        if (data.status === 'accepted' && data.game_id) {
          if (pollRef.current) clearInterval(pollRef.current);
          const newColor = playerColor === 'white' ? 'black' : 'white';
          window.location.href = `/game?time=${encodeURIComponent(timeControl)}&color=${newColor}&online_game_id=${data.game_id}&online=true&opponent_name=${encodeURIComponent(opponentName)}&opponent_rating=${opponentRating || 0}&opponent_avatar=${encodeURIComponent(opponentAvatar)}`;
        } else if (data.status === 'declined') {
          if (pollRef.current) clearInterval(pollRef.current);
          setRematchSent(false);
          setRematchError('Соперник отклонил реванш');
        }
      } catch { /* ignore */ }
    }, 2000);
  }, [myUserId, playerColor, timeControl, opponentName, opponentRating, opponentAvatar]);

  const offerRematch = useCallback(async () => {
    if (!isOnline) { window.location.reload(); return; }
    setRematchSent(true);
    const result = await handleOfferRematch(opponentUserId, timeControl);
    if (result.error) {
      setRematchSent(false);
      setRematchCooldown(true);
      setRematchError(result.error);
    } else if (result.inviteId) {
      startPoll(result.inviteId);
    }
  }, [isOnline, opponentUserId, timeControl, handleOfferRematch, startPoll]);

  return { rematchSent, rematchCooldown, rematchError, setRematchError, offerRematch };
};
