import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/config/api';

const REMATCH_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 2_000;

interface UseRematchOptions {
  isOnline: boolean;
  isBotMatchmaking?: boolean;
  opponentUserId?: string;
  timeControl: string;
  playerColor: 'white' | 'black';
  opponentName: string;
  opponentRating?: number;
  opponentAvatar: string;
  myUserId: string;
  difficulty?: string;
  handleOfferRematch: (toUserId?: string, timeControl?: string) => Promise<{ error?: string; inviteId?: number }>;
}

export const useRematch = ({
  isOnline,
  isBotMatchmaking,
  opponentUserId,
  timeControl,
  playerColor,
  opponentName,
  opponentRating,
  opponentAvatar,
  myUserId,
  difficulty,
  handleOfferRematch,
}: UseRematchOptions) => {
  const navigate = useNavigate();
  const [rematchSent, setRematchSent] = useState(false);
  const [rematchCooldown, setRematchCooldown] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [rematchTimeoutLeft, setRematchTimeoutLeft] = useState<number | null>(null);
  const [botRematchPending, setBotRematchPending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setRematchTimeoutLeft(null);
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
      if (botTimerRef.current) { clearTimeout(botTimerRef.current); botTimerRef.current = null; }
    };
  }, []);

  const startPoll = useCallback((inviteId: number) => {
    stopAll();

    // Countdown для отображения оставшегося времени
    setRematchTimeoutLeft(REMATCH_TIMEOUT_MS / 1000);
    countdownRef.current = setInterval(() => {
      setRematchTimeoutLeft(prev => (prev !== null && prev > 1 ? prev - 1 : prev));
    }, 1000);

    // Жёсткий таймаут 60 сек
    timeoutRef.current = setTimeout(() => {
      stopAll();
      setRematchSent(false);
      setRematchCooldown(true);
      setRematchError('Соперник не ответил на приглашение');
    }, REMATCH_TIMEOUT_MS);

    // Опрос принятия
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API.inviteGame}?action=check_accepted&invite_id=${inviteId}&user_id=${encodeURIComponent(myUserId)}`);
        const data = await res.json();
        if (data.status === 'accepted' && data.game_id) {
          stopAll();
          const newColor = playerColor === 'white' ? 'black' : 'white';
          navigate(`/game?time=${encodeURIComponent(timeControl)}&color=${newColor}&online_game_id=${data.game_id}&online=true&opponent_name=${encodeURIComponent(opponentName)}&opponent_rating=${opponentRating || 0}&opponent_avatar=${encodeURIComponent(opponentAvatar)}`);
        } else if (data.status === 'declined') {
          stopAll();
          setRematchSent(false);
          setRematchCooldown(true);
          setRematchError('Соперник отклонил реванш');
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL_MS);
  }, [myUserId, playerColor, timeControl, opponentName, opponentRating, opponentAvatar, stopAll]);

  const navigateRef = useRef(navigate);
  const isOnlineRef = useRef(isOnline);
  const isBotMatchmakingRef = useRef(isBotMatchmaking);
  const timeControlRef = useRef(timeControl);
  const playerColorRef = useRef(playerColor);
  const opponentNameRef = useRef(opponentName);
  const opponentAvatarRef = useRef(opponentAvatar);
  const opponentRatingRef = useRef(opponentRating);
  const difficultyRef = useRef(difficulty || 'medium');
  navigateRef.current = navigate;
  isOnlineRef.current = isOnline;
  isBotMatchmakingRef.current = isBotMatchmaking;
  timeControlRef.current = timeControl;
  playerColorRef.current = playerColor;
  opponentNameRef.current = opponentName;
  opponentAvatarRef.current = opponentAvatar;
  opponentRatingRef.current = opponentRating;
  difficultyRef.current = difficulty || 'medium';

  const offerRematch = useCallback(async () => {
    // Режим "Играть с компьютером" — мгновенный старт
    if (!isOnlineRef.current && !isBotMatchmakingRef.current) {
      navigateRef.current(`/game?time=${encodeURIComponent(timeControlRef.current)}&color=${playerColorRef.current === 'white' ? 'black' : 'white'}&difficulty=${difficultyRef.current}&opponent_name=${encodeURIComponent(opponentNameRef.current)}&opponent_avatar=${encodeURIComponent(opponentAvatarRef.current)}`);
      return;
    }
    // Режим "Играть онлайн" с ботом — бот думает 3-7 сек, соглашается/отказывается
    if (isBotMatchmakingRef.current) {
      setBotRematchPending(true);
      const delay = 3000 + Math.random() * 4000;
      botTimerRef.current = setTimeout(() => {
        botTimerRef.current = null;
        const accepted = Math.random() < 0.5;
        if (accepted) {
          setBotRematchPending(false);
          navigateRef.current(`/game?time=${encodeURIComponent(timeControlRef.current)}&color=${playerColorRef.current === 'white' ? 'black' : 'white'}&bot_game=true&opponent_name=${encodeURIComponent(opponentNameRef.current)}&opponent_rating=${opponentRatingRef.current || 0}&opponent_avatar=${encodeURIComponent(opponentAvatarRef.current)}&difficulty=${difficultyRef.current}`);
        } else {
          setBotRematchPending(false);
          setRematchCooldown(true);
          setRematchError('Соперник отклонил реванш');
        }
      }, delay);
      return;
    }
    // Реальный онлайн — через API
    setRematchSent(true);
    const result = await handleOfferRematch(opponentUserId, timeControl);
    if (result.error) {
      setRematchSent(false);
      setRematchCooldown(true);
      setRematchError(result.error);
    } else if (result.inviteId) {
      startPoll(result.inviteId);
    }
  }, [opponentUserId, timeControl, handleOfferRematch, startPoll]);

  const cancelBotRematch = useCallback(() => {
    if (botTimerRef.current) { clearTimeout(botTimerRef.current); botTimerRef.current = null; }
    setBotRematchPending(false);
  }, []);

  return { rematchSent, rematchCooldown, rematchError, rematchTimeoutLeft, setRematchError, offerRematch, botRematchPending, cancelBotRematch };
};