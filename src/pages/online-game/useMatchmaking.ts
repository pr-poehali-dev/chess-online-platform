import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MATCHMAKING_URL = 'https://functions.poehali.dev/49a14316-cb91-4aec-85f7-e5f2f6590299';
const POLL_INTERVAL = 2000;
const WIDEN_RATING_DELAY = 8000;
const BOT_OFFER_DELAY = 8000;

export type SearchStatus = 'searching' | 'searching_any' | 'no_opponents' | 'found' | 'starting';

export interface OpponentData {
  name: string;
  rating: number;
  avatar: string;
  isBotGame: boolean;
}

const useMatchmaking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opponentType = searchParams.get('opponent') as 'city' | 'region' | 'country' | null;
  const timeControl = searchParams.get('time') || 'rapid';
  const colorParam = searchParams.get('color') || 'random';

  const [searchStatus, setSearchStatus] = useState<SearchStatus>('searching');
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameId, setGameId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [searchTime, setSearchTime] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botOfferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortedRef = useRef(false);
  const matchFoundRef = useRef(false);

  const getUserData = useCallback(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return null;
    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    return { ...userData, id: userId };
  }, []);

  const cleanup = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (searchTimerRef.current) { clearInterval(searchTimerRef.current); searchTimerRef.current = null; }
    if (botOfferTimerRef.current) { clearTimeout(botOfferTimerRef.current); botOfferTimerRef.current = null; }
  }, []);

  const cancelSearch = useCallback(async () => {
    abortedRef.current = true;
    cleanup();
    const user = getUserData();
    if (user) {
      fetch(MATCHMAKING_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      }).catch(() => {});
    }
    navigate('/');
  }, [cleanup, getUserData, navigate]);

  useEffect(() => {
    const user = getUserData();
    if (!user) { navigate('/'); return; }

    abortedRef.current = false;
    matchFoundRef.current = false;

    searchTimerRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    const searchForOpponent = async () => {
      if (abortedRef.current) return;

      const res = await fetch(MATCHMAKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          user_id: user.id,
          username: user.name || 'Player',
          avatar: user.avatar || '',
          rating: user.rating || 1200,
          opponent_type: opponentType || 'country',
          time_control: timeControl
        })
      });
      const data = await res.json();

      if (abortedRef.current) return;

      if (data.status === 'matched') {
        matchFoundRef.current = true;
        cleanup();
        setOpponent({
          name: data.opponent_name,
          rating: data.opponent_rating,
          avatar: data.opponent_avatar || '',
          isBotGame: false
        });
        setPlayerColor(data.player_color);
        setGameId(data.game_id);
        setSearchStatus('found');
        setTimeout(() => {
          if (!abortedRef.current) setSearchStatus('starting');
        }, 2000);
        return;
      }
    };

    searchForOpponent();
    pollRef.current = setInterval(searchForOpponent, POLL_INTERVAL);

    botOfferTimerRef.current = setTimeout(() => {
      if (!abortedRef.current && !matchFoundRef.current) {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setSearchStatus('searching_any');
        startAnyRatingSearch(user);
      }
    }, WIDEN_RATING_DELAY);

    return () => {
      cleanup();
      if (!matchFoundRef.current) {
        const u = getUserData();
        if (u) {
          fetch(MATCHMAKING_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: u.id })
          }).catch(() => {});
        }
      }
    };
  }, [opponentType, timeControl]);

  const handlePlayBot = useCallback(async () => {
    const user = getUserData();
    if (!user) return;

    const res = await fetch(MATCHMAKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'play_bot',
        user_id: user.id,
        username: user.name || 'Player',
        avatar: user.avatar || '',
        rating: user.rating || 1200,
        opponent_type: opponentType || 'country',
        time_control: timeControl
      })
    });
    const data = await res.json();

    if (data.status === 'bot_game') {
      setOpponent({
        name: data.opponent_name,
        rating: data.opponent_rating,
        avatar: '',
        isBotGame: true
      });
      setPlayerColor(data.player_color);
      setGameId(data.game_id);
      setSearchStatus('found');
      setTimeout(() => setSearchStatus('starting'), 2000);
    }
  }, [getUserData, opponentType, timeControl]);

  const startAnyRatingSearch = useCallback((user: { id: string; name?: string; avatar?: string; rating?: number }) => {
    abortedRef.current = false;
    matchFoundRef.current = false;

    const searchAny = async () => {
      if (abortedRef.current) return;
      const res = await fetch(MATCHMAKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          user_id: user.id,
          username: user.name || 'Player',
          avatar: user.avatar || '',
          rating: user.rating || 1200,
          opponent_type: opponentType || 'country',
          time_control: timeControl,
          any_rating: true
        })
      });
      const data = await res.json();
      if (abortedRef.current) return;
      if (data.status === 'matched') {
        matchFoundRef.current = true;
        cleanup();
        setOpponent({
          name: data.opponent_name,
          rating: data.opponent_rating,
          avatar: data.opponent_avatar || '',
          isBotGame: false
        });
        setPlayerColor(data.player_color);
        setGameId(data.game_id);
        setSearchStatus('found');
        setTimeout(() => {
          if (!abortedRef.current) setSearchStatus('starting');
        }, 2000);
      }
    };

    searchAny();
    pollRef.current = setInterval(searchAny, POLL_INTERVAL);

    botOfferTimerRef.current = setTimeout(() => {
      if (!abortedRef.current && !matchFoundRef.current) {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setSearchStatus('no_opponents');
      }
    }, BOT_OFFER_DELAY);
  }, [opponentType, timeControl, cleanup]);

  const handleContinueSearch = useCallback(() => {
    setSearchStatus('searching');
    abortedRef.current = false;
    matchFoundRef.current = false;
    const user = getUserData();
    if (!user) return;

    const searchForOpponent = async () => {
      if (abortedRef.current) return;
      const res = await fetch(MATCHMAKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          user_id: user.id,
          username: user.name || 'Player',
          avatar: user.avatar || '',
          rating: user.rating || 1200,
          opponent_type: opponentType || 'country',
          time_control: timeControl
        })
      });
      const data = await res.json();
      if (abortedRef.current) return;
      if (data.status === 'matched') {
        matchFoundRef.current = true;
        cleanup();
        setOpponent({
          name: data.opponent_name,
          rating: data.opponent_rating,
          avatar: data.opponent_avatar || '',
          isBotGame: false
        });
        setPlayerColor(data.player_color);
        setGameId(data.game_id);
        setSearchStatus('found');
        setTimeout(() => {
          if (!abortedRef.current) setSearchStatus('starting');
        }, 2000);
      }
    };

    searchForOpponent();
    pollRef.current = setInterval(searchForOpponent, POLL_INTERVAL);

    botOfferTimerRef.current = setTimeout(() => {
      if (!abortedRef.current && !matchFoundRef.current) {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setSearchStatus('no_opponents');
      }
    }, BOT_OFFER_DELAY);
  }, [getUserData, opponentType, timeControl, cleanup]);

  useEffect(() => {
    if (searchStatus === 'starting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            const isBotGame = opponent?.isBotGame;
            if (isBotGame) {
              navigate(`/game?difficulty=medium&time=${timeControl}&color=${playerColor}&online_game_id=${gameId}&bot_game=true&opponent_name=${encodeURIComponent(opponent?.name || '')}`);
            } else {
              navigate(`/game?time=${timeControl}&color=${playerColor}&online_game_id=${gameId}&online=true&opponent_name=${encodeURIComponent(opponent?.name || '')}&opponent_rating=${opponent?.rating || 0}&opponent_avatar=${encodeURIComponent(opponent?.avatar || '')}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [searchStatus, navigate, timeControl, opponent, playerColor, gameId]);

  return {
    searchStatus,
    opponent,
    playerColor,
    gameId,
    countdown,
    searchTime,
    opponentType,
    timeControl,
    cancelSearch,
    handlePlayBot,
    handleContinueSearch
  };
};

export default useMatchmaking;