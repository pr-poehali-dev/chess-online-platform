import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const ONLINE_MOVE_URL = 'https://functions.poehali.dev/58a413af-81c4-47bd-b3ce-4552a349ae19';

export const useGameHandlers = (
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw', 
  setGameStatus: (status: 'playing' | 'checkmate' | 'stalemate' | 'draw') => void,
  moveCount: number = 0,
  onlineGameId?: number
) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showDrawOffer, setShowDrawOffer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRematchOffer, setShowRematchOffer] = useState(false);
  const [showOpponentLeft, setShowOpponentLeft] = useState(false);
  const [opponentLeftReason, setOpponentLeftReason] = useState<'early' | 'surrender' | 'exit'>('exit');
  const [drawOffersCount, setDrawOffersCount] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isOwn: boolean; time: string }>>([]);
  const [isChatBlocked, setIsChatBlocked] = useState(false);
  const [isChatBlockedByOpponent, setIsChatBlockedByOpponent] = useState(false);
  const [rematchSent, setRematchSent] = useState(false);
  const [rematchDeclinedByOpponent, setRematchDeclinedByOpponent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isOnlineGame = !!onlineGameId;

  const getUserId = useCallback(() => {
    const saved = localStorage.getItem('chessUser');
    if (!saved) return '';
    const userData = JSON.parse(saved);
    const rawId = userData.email || userData.name || 'anonymous';
    return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, historyRef: React.RefObject<HTMLDivElement>) => {
    if (!historyRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - historyRef.current.offsetLeft);
    setScrollLeft(historyRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent, historyRef: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !historyRef.current) return;
    e.preventDefault();
    const x = e.pageX - historyRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    historyRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleExitClick = () => {
    if (gameStatus !== 'playing') {
      navigate('/');
    } else {
      if (moveCount <= 2) {
        if (confirm('Выйти из игры? Так как партия только началась (менее 3 ходов), это не повлияет на рейтинг.')) {
          localStorage.removeItem('activeGame');
          navigate('/');
        }
      } else {
        setShowExitDialog(true);
      }
    }
  };

  const handleSurrender = () => {
    setShowSettingsMenu(false);
    
    const message = moveCount <= 2 
      ? 'Выйти из игры? Так как партия только началась (менее 3 ходов), это не повлияет на рейтинг.'
      : 'Вы действительно хотите сдаться? Партия будет засчитана как поражение.';
    
    if (confirm(message)) {
      if (moveCount <= 2) {
        localStorage.removeItem('activeGame');
        navigate('/');
      } else {
        setGameStatus('checkmate');
      }
      setShowExitDialog(false);
    }
  };

  const handleContinue = () => {
    setShowExitDialog(false);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      isOwn: true,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');

    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBlockOpponent = () => {
    setIsChatBlocked(true);
  };

  const handleUnblockOpponent = () => {
    setIsChatBlocked(false);
  };

  const handleOfferDraw = () => {
    setShowSettingsMenu(false);
    
    if (drawOffersCount >= 2) {
      alert('Вы уже предлагали ничью 2 раза. Больше нельзя предлагать ничью в этой партии.');
      return;
    }
    
    setDrawOffersCount(drawOffersCount + 1);
    setTimeout(() => {
      setShowDrawOffer(true);
    }, 500);
  };

  const handleAcceptDraw = () => {
    setShowDrawOffer(false);
    setGameStatus('draw');
  };

  const handleDeclineDraw = () => {
    setShowDrawOffer(false);
  };

  const handleNewGame = () => {
    setShowSettingsMenu(false);
    
    if (gameStatus === 'playing') {
      if (confirm('Чтобы начать новую партию, необходимо завершить текущую. Сдаться и начать новую игру?')) {
        setGameStatus('checkmate');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } else {
      window.location.reload();
    }
  };

  const handleOfferRematch = useCallback(async () => {
    if (!isOnlineGame || !onlineGameId) {
      window.location.reload();
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await fetch(ONLINE_MOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'offer_rematch',
          game_id: onlineGameId,
          user_id: userId
        })
      });
      const data = await res.json();
      if (data.status === 'rematch_offered') {
        setRematchSent(true);
      }
    } catch (e) {
      console.error('Failed to offer rematch:', e);
    }
  }, [isOnlineGame, onlineGameId, getUserId]);

  const handleAcceptRematch = useCallback(async () => {
    if (!isOnlineGame || !onlineGameId) {
      setShowRematchOffer(false);
      window.location.reload();
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await fetch(ONLINE_MOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_rematch',
          game_id: onlineGameId,
          user_id: userId
        })
      });
      const data = await res.json();
      if (data.status === 'rematch_accepted' && data.new_game_id) {
        const newColor = data.player_color || 'white';
        const searchParams = new URLSearchParams(window.location.search);
        const opponentName = searchParams.get('opponent_name') || '';
        const opponentRating = searchParams.get('opponent_rating') || '';
        const opponentAvatar = searchParams.get('opponent_avatar') || '';
        const timeControl = searchParams.get('time') || '10+0';

        navigate(`/game?online=true&online_game_id=${data.new_game_id}&color=${newColor}&time=${timeControl}&opponent_name=${opponentName}&opponent_rating=${opponentRating}&opponent_avatar=${opponentAvatar}`);
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (e) {
      console.error('Failed to accept rematch:', e);
    }
  }, [isOnlineGame, onlineGameId, getUserId, navigate]);

  const handleDeclineRematch = useCallback(async () => {
    setShowRematchOffer(false);

    if (!isOnlineGame || !onlineGameId) return;

    const userId = getUserId();
    if (!userId) return;

    try {
      await fetch(ONLINE_MOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline_rematch',
          game_id: onlineGameId,
          user_id: userId
        })
      });
    } catch (e) {
      console.error('Failed to decline rematch:', e);
    }
  }, [isOnlineGame, onlineGameId, getUserId]);

  return {
    isDragging,
    showExitDialog,
    showChat,
    setShowChat,
    showSettingsMenu,
    setShowSettingsMenu,
    showDrawOffer,
    showNotifications,
    setShowNotifications,
    showRematchOffer,
    setShowRematchOffer,
    showOpponentLeft,
    setShowOpponentLeft,
    opponentLeftReason,
    chatMessage,
    setChatMessage,
    chatMessages,
    chatEndRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    handleExitClick,
    handleSurrender,
    handleContinue,
    handleSendMessage,
    handleChatKeyPress,
    handleBlockOpponent,
    handleUnblockOpponent,
    isChatBlocked,
    isChatBlockedByOpponent,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    handleNewGame,
    handleOfferRematch,
    handleAcceptRematch,
    handleDeclineRematch,
    rematchSent,
    rematchDeclinedByOpponent,
    setRematchDeclinedByOpponent
  };
};