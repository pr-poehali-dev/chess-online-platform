import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGameHandlers = (gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw', setGameStatus: (status: 'playing' | 'checkmate' | 'stalemate' | 'draw') => void) => {
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
  const [drawOffersCount, setDrawOffersCount] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isOwn: boolean; time: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      const savedState = localStorage.getItem('activeGame');
      let moveCount = 0;
      
      if (savedState) {
        try {
          const gameState = JSON.parse(savedState);
          moveCount = gameState.moveHistory?.length || 0;
        } catch (error) {
          // Ignore parsing errors
        }
      }
      
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
    
    const savedState = localStorage.getItem('activeGame');
    let moveCount = 0;
    
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        moveCount = gameState.moveHistory?.length || 0;
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
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
    if (confirm('Вы действительно хотите заблокировать соперника? Вы больше не сможете получать от него сообщения.')) {
      const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
      blockedUsers.push('computer-opponent');
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
      
      setShowChat(false);
      alert('Соперник заблокирован');
    }
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

  const handleAcceptRematch = () => {
    setShowRematchOffer(false);
    window.location.reload();
  };

  const handleDeclineRematch = () => {
    setShowRematchOffer(false);
  };

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
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    handleNewGame,
    handleAcceptRematch,
    handleDeclineRematch
  };
};