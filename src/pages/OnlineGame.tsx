import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MATCHMAKING_URL = 'https://functions.poehali.dev/49a14316-cb91-4aec-85f7-e5f2f6590299';
const POLL_INTERVAL = 2000;
const WIDEN_RATING_DELAY = 8000;
const BOT_OFFER_DELAY = 8000;

const OnlineGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opponentType = searchParams.get('opponent') as 'city' | 'region' | 'country' | null;
  const timeControl = searchParams.get('time') || 'rapid';
  const colorParam = searchParams.get('color') || 'random';

  const [searchStatus, setSearchStatus] = useState<'searching' | 'no_exact_rating' | 'searching_any' | 'no_opponents' | 'found' | 'starting'>('searching');
  const [opponent, setOpponent] = useState<{
    name: string;
    rating: number;
    avatar: string;
    isBotGame: boolean;
  } | null>(null);
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
        setSearchStatus('no_exact_rating');
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

  const handleSearchAnyRating = useCallback(() => {
    setSearchStatus('searching_any');
    abortedRef.current = false;
    matchFoundRef.current = false;
    const user = getUserData();
    if (!user) return;

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
  }, [getUserData, opponentType, timeControl, cleanup]);

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

  const getTimeLabel = (time: string | null) => {
    if (time && time.includes('+')) {
      const [mins, inc] = time.split('+');
      if (inc === '0') return `${mins} мин`;
      return `${mins}+${inc}`;
    }
    switch(time) {
      case 'blitz': return 'Блиц 3+2';
      case 'rapid': return 'Рапид 10+5';
      case 'classic': return 'Классика 15+10';
      default: return time || 'Неизвестно';
    }
  };

  const getOpponentTypeLabel = (type: string | null) => {
    switch(type) {
      case 'city': return 'из вашего города';
      case 'region': return 'из вашего региона';
      case 'country': return 'из России';
      default: return '';
    }
  };

  const botAvatar = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files/5a37bc71-a83e-4a96-b899-abd4e284ef6e.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-stone-900/80 border-stone-700 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          {searchStatus === 'searching' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="Search" size={32} className="text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Поиск соперника</h2>
                <p className="text-stone-400">
                  Ищем игрока {getOpponentTypeLabel(opponentType)}
                </p>
                <p className="text-sm text-stone-500 mt-2">
                  Контроль времени: {getTimeLabel(timeControl)}
                </p>
                <p className="text-xs text-stone-600 mt-2">
                  Поиск: {searchTime} сек
                </p>
              </div>

              <Button
                onClick={cancelSearch}
                variant="outline"
                className="border-stone-600 text-stone-300 hover:bg-stone-800"
              >
                Отменить поиск
              </Button>
            </div>
          )}

          {searchStatus === 'no_exact_rating' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <Icon name="Users" size={64} className="text-amber-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Нет соперников ±50</h2>
                <p className="text-stone-400">
                  Не нашли игрока с близким рейтингом
                </p>
                <p className="text-sm text-stone-500 mt-2">
                  Можем поискать соперника с любым рейтингом
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSearchAnyRating}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
                >
                  <Icon name="Search" size={20} className="mr-2" />
                  Играть с любым рейтингом
                </Button>
                <Button
                  onClick={handlePlayBot}
                  variant="outline"
                  className="border-stone-600 text-stone-300 hover:bg-stone-800"
                >
                  <Icon name="Bot" size={20} className="mr-2" />
                  Сыграть с ботом
                </Button>
                <Button
                  onClick={cancelSearch}
                  variant="ghost"
                  className="text-stone-500 hover:text-stone-300"
                >
                  Вернуться
                </Button>
              </div>
            </div>
          )}

          {searchStatus === 'searching_any' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="Search" size={32} className="text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Ищем соперника</h2>
                <p className="text-stone-400">Любой рейтинг</p>
                <p className="text-sm text-stone-500 mt-2">
                  Контроль времени: {getTimeLabel(timeControl)}
                </p>
              </div>

              <Button
                onClick={cancelSearch}
                variant="outline"
                className="border-stone-600 text-stone-300 hover:bg-stone-800"
              >
                Отменить поиск
              </Button>
            </div>
          )}

          {searchStatus === 'no_opponents' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <Icon name="UserX" size={64} className="text-amber-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Соперников нет</h2>
                <p className="text-stone-400">
                  Сейчас нет онлайн-игроков
                </p>
                <p className="text-sm text-stone-500 mt-2">
                  Вы можете сыграть с нашим ботом или продолжить ожидание
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handlePlayBot}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
                >
                  <Icon name="Bot" size={20} className="mr-2" />
                  Сыграть с ботом
                </Button>
                <Button
                  onClick={handleContinueSearch}
                  variant="outline"
                  className="border-stone-600 text-stone-300 hover:bg-stone-800"
                >
                  <Icon name="Search" size={20} className="mr-2" />
                  Продолжить поиск
                </Button>
                <Button
                  onClick={cancelSearch}
                  variant="ghost"
                  className="text-stone-500 hover:text-stone-300"
                >
                  Вернуться
                </Button>
              </div>
            </div>
          )}

          {searchStatus === 'found' && opponent && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <Icon name="CheckCircle" size={64} className="text-green-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-4">
                  {opponent.isBotGame ? 'Играем с ботом!' : 'Соперник найден!'}
                </h2>

                <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-stone-800/50 border border-stone-700">
                  {opponent.isBotGame ? (
                    <img src={botAvatar} alt={opponent.name} className="w-24 h-24 rounded-full ring-4 ring-amber-400 object-cover" />
                  ) : opponent.avatar ? (
                    <img src={opponent.avatar} alt={opponent.name} className="w-24 h-24 rounded-full ring-4 ring-amber-400 object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full ring-4 ring-amber-400 bg-stone-700 flex items-center justify-center">
                      <Icon name="User" size={40} className="text-stone-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-bold text-stone-100">{opponent.name}</div>
                    <div className="text-lg font-bold text-amber-400 mt-2">
                      Рейтинг: {opponent.rating}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-400 mt-4">
                  {getTimeLabel(timeControl)}
                </p>
              </div>
            </div>
          )}

          {searchStatus === 'starting' && opponent && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className="text-8xl font-bold text-amber-400 animate-pulse">
                  {countdown}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Начинаем игру...</h2>
                <p className="text-stone-400">Подготовьтесь к партии</p>
              </div>

              <div className="flex items-center justify-center gap-8 p-6 rounded-lg bg-stone-800/50 border border-stone-700">
                <div className="text-center">
                  <div className="text-4xl mb-2">{playerColor === 'white' ? '♔' : '♚'}</div>
                  <div className="text-sm font-semibold text-stone-200">Вы</div>
                  <div className="text-xs text-stone-400">{playerColor === 'white' ? 'Белые' : 'Чёрные'}</div>
                </div>

                <div className="text-3xl text-amber-400">VS</div>

                <div className="text-center">
                  {opponent.isBotGame ? (
                    <img src={botAvatar} alt={opponent.name} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover" />
                  ) : opponent.avatar ? (
                    <img src={opponent.avatar} alt={opponent.name} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover" />
                  ) : (
                    <div className="text-4xl mb-2">{playerColor === 'white' ? '♚' : '♔'}</div>
                  )}
                  <div className="text-sm font-semibold text-stone-200">{opponent.name}</div>
                  <div className="text-xs text-stone-400">{playerColor === 'white' ? 'Чёрные' : 'Белые'}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineGame;