import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { getDifficultyLabel, formatTime } from './game/gameTypes';
import { GameBoard, GameResult } from './game/GameBoard';
import { PlayerInfo } from './game/PlayerInfo';
import { MoveHistory } from './game/MoveHistory';
import { ExitDialog } from './game/ExitDialog';
import { GameChatModal } from './game/GameChatModal';
import { DrawOfferModal } from './game/DrawOfferModal';
import { NotificationsModal } from './game/NotificationsModal';
import { RematchModal } from './game/RematchModal';
import { OpponentLeftModal } from './game/OpponentLeftModal';
import { GameHeader, GameControls } from './game/GameHeader';
import { ConfirmDialog } from './game/ConfirmDialog';
import { useGameLogic } from './game/useGameLogic';
import API from '@/config/api';
import { useGameHandlers } from './game/useGameHandlers';
import PlayerProfileModal from '@/components/chess/PlayerProfileModal';

const Game = () => {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'medium') as 'easy' | 'medium' | 'hard' | 'master';
  const timeControl = searchParams.get('time') || '10+0';
  const opponentType = searchParams.get('opponent');
  const colorParam = searchParams.get('color') || 'random';
  const onlineGameId = searchParams.get('online_game_id');
  const isOnlineReal = searchParams.get('online') === 'true';
  const isBotFromMatchmaking = searchParams.get('bot_game') === 'true';
  const paramOpponentName = searchParams.get('opponent_name') ? decodeURIComponent(searchParams.get('opponent_name')!) : '';
  const paramOpponentRating = searchParams.get('opponent_rating') ? Number(searchParams.get('opponent_rating')) : 0;
  const paramOpponentAvatar = searchParams.get('opponent_avatar') ? decodeURIComponent(searchParams.get('opponent_avatar')!) : '';
  
  const [playerColor] = useState<'white' | 'black'>(() => {
    if (colorParam === 'white') return 'white';
    if (colorParam === 'black') return 'black';
    return Math.random() < 0.5 ? 'white' : 'black';
  });
  
  const flipped = playerColor === 'black';

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch { /* wake lock not available */ }
    };
    requestWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      wakeLockRef.current?.release();
    };
  }, []);

  const [showOpponentProfile, setShowOpponentProfile] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  
  const savedUser = localStorage.getItem('chessUser');
  const userData = savedUser ? JSON.parse(savedUser) : null;
  const userAvatar = userData?.avatar || '';
  const myUserId = userData ? 'u_' + (userData.email || userData.name || 'anonymous').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60) : '';
  const isPlayingWithBot = (!opponentType || opponentType === 'random') && !isOnlineReal;
  
  const botAvatar = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files/5a37bc71-a83e-4a96-b899-abd4e284ef6e.jpg';
  const opponentAvatar = isOnlineReal ? (paramOpponentAvatar || '') : (isPlayingWithBot || isBotFromMatchmaking) ? botAvatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent';
  const opponentName = isOnlineReal ? (paramOpponentName || 'Соперник') : (isPlayingWithBot || isBotFromMatchmaking) ? (paramOpponentName || 'Бот') : 'Соперник';
  const opponentRating = isOnlineReal ? (paramOpponentRating || undefined) : (isPlayingWithBot ? undefined : paramOpponentRating || undefined);

  const {
    displayBoard,
    currentPlayer,
    whiteTime,
    blackTime,
    gameStatus,
    setGameStatus,
    moveHistory,
    currentMoveIndex,
    inactivityTimer,
    opponentInactivityTimer,
    capturedByWhite,
    capturedByBlack,
    kingInCheckPosition,
    lastMove,
    endReason: serverEndReason,
    rematchOfferedBy,
    rematchStatus,
    rematchGameId,
    setCurrentPlayer,
    showPossibleMoves,
    setShowPossibleMoves,
    theme,
    setTheme,
    boardTheme,
    setBoardTheme,
    ratingChange,
    newRating,
    userRating,
    connectionLost,
    connectionRestored,
    p2pConnected,
    p2pLatency,
    p2pQuality,
    historyRef,
    handleSquareClick,
    isSquareSelected,
    isSquarePossibleMove,
    handlePreviousMove,
    handleNextMove
  } = useGameLogic(difficulty, timeControl, playerColor, isOnlineReal ? Number(onlineGameId) : undefined);

  useEffect(() => {
    localStorage.setItem('currentGameFinished', gameStatus !== 'playing' ? '1' : '');
  }, [gameStatus]);

  useEffect(() => {
    if (isOnlineReal && onlineGameId && gameStatus === 'playing') {
      localStorage.setItem('activeOnlineGame', JSON.stringify({
        gameId: onlineGameId,
        color: playerColor,
        opponentName,
        opponentAvatar,
        opponentRating,
        url: window.location.pathname + window.location.search
      }));
    } else if (isOnlineReal && gameStatus !== 'playing') {
      localStorage.removeItem('activeOnlineGame');
    }
  }, [gameStatus, isOnlineReal, onlineGameId]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('currentGameFinished');
    };
  }, []);

  const {
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
    handleAcceptRematch,
    handleDeclineRematch,
    handleOfferRematch,
    confirmDialog,
    handleConfirmDialogConfirm,
    handleConfirmDialogCancel
  } = useGameHandlers(gameStatus, setGameStatus, moveHistory.length, playerColor, setCurrentPlayer, isOnlineReal ? Number(onlineGameId) : undefined, isOnlineReal ? API.onlineMove : undefined);

  const [rematchSent, setRematchSent] = useState(false);
  const [rematchCooldown, setRematchCooldown] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnlineReal || !rematchOfferedBy || rematchStatus !== 'pending') return;
    if (rematchOfferedBy === myUserId) return;
    setShowRematchOffer(true);
  }, [rematchOfferedBy, rematchStatus]);

  useEffect(() => {
    if (!isOnlineReal || !rematchGameId || rematchStatus !== 'accepted') return;
    const newColor = playerColor === 'white' ? 'black' : 'white';
    const params = new URLSearchParams(window.location.search);
    params.set('online_game_id', String(rematchGameId));
    params.set('color', newColor);
    params.set('online', 'true');
    window.location.href = `/game?${params.toString()}`;
  }, [rematchGameId, rematchStatus]);

  useEffect(() => {
    if ((rematchStatus === 'declined' || rematchStatus === 'expired') && rematchSent) {
      setRematchSent(false);
    }
  }, [rematchStatus]);

  const isViewingHistory = currentMoveIndex < moveHistory.length;

  useEffect(() => {
    if (isViewingHistory) setResultDismissed(true);
    else setResultDismissed(false);
  }, [isViewingHistory]);

  const gameResult: GameResult = (() => {
    if (showRematchOffer || resultDismissed) return null;
    if (gameStatus === 'playing') return null;
    if (gameStatus === 'draw' || gameStatus === 'stalemate') return 'draw';
    if (gameStatus === 'checkmate') {
      const iWon = currentPlayer !== playerColor;
      if (iWon && serverEndReason === 'resign') return 'opponent_resigned';
      return iWon ? 'win' : 'loss';
    }
    return null;
  })();

  const dismissResult = () => {
    if (gameResult) setResultDismissed(true);
  };

  return (
    <div onClick={dismissResult} className={`h-[100dvh] flex flex-col transition-colors overflow-hidden ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300' 
        : 'bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950'
    }`}>
      <GameHeader
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        setShowChat={setShowChat}
        handleExitClick={handleExitClick}
        handleOfferDraw={handleOfferDraw}
        handleSurrender={handleSurrender}
        handleNewGame={handleNewGame}
        setShowNotifications={setShowNotifications}
        showPossibleMoves={showPossibleMoves}
        setShowPossibleMoves={setShowPossibleMoves}
        theme={theme}
        setTheme={setTheme}
        boardTheme={boardTheme}
        setBoardTheme={setBoardTheme}
      />

      {isOnlineReal && connectionLost && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center text-sm py-2 font-semibold animate-pulse">
          <Icon name="WifiOff" size={16} className="inline mr-2 -mt-0.5" />
          Потеря связи с сервером...
        </div>
      )}
      {isOnlineReal && connectionRestored && !connectionLost && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white text-center text-sm py-2 font-semibold">
          <Icon name="Wifi" size={16} className="inline mr-2 -mt-0.5" />
          Связь восстановлена
        </div>
      )}


      <main className="flex-1 flex items-center justify-center p-1 sm:p-2 md:p-3 overflow-hidden min-h-0">
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 w-full" style={{ maxWidth: 'min(calc(100vw - 8px), min(calc(100dvh - 300px), 700px))' }}>
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <GameControls
                showSettingsMenu={showSettingsMenu}
                setShowSettingsMenu={setShowSettingsMenu}
                setShowChat={setShowChat}
                handleExitClick={handleExitClick}
                handleOfferDraw={handleOfferDraw}
                handleSurrender={handleSurrender}
                handleNewGame={handleNewGame}
                setShowNotifications={setShowNotifications}
                showPossibleMoves={showPossibleMoves}
                setShowPossibleMoves={setShowPossibleMoves}
                theme={theme}
                setTheme={setTheme}
                boardTheme={boardTheme}
                setBoardTheme={setBoardTheme}
                gameStatus={gameStatus}
                currentPlayer={currentPlayer}
                playerColor={playerColor}
                setShowRematchOffer={setShowRematchOffer}
                onOfferRematch={isOnlineReal ? async () => {
                  setRematchSent(true);
                  const result = await handleOfferRematch();
                  if (result.error) {
                    setRematchSent(false);
                    setRematchCooldown(true);
                    setRematchError(result.error);
                  }
                } : () => { window.location.reload(); }}
                rematchSent={rematchSent}
                rematchCooldown={rematchCooldown}
                isOnline={isOnlineReal}
                p2pConnected={p2pConnected}
                p2pQuality={p2pQuality}
                p2pLatency={p2pLatency}
                connectionLost={connectionLost}
              />

              <PlayerInfo
                playerName={opponentName}
                playerColor={playerColor === 'white' ? 'black' : 'white'}
                icon={playerColor === 'white' ? '♚' : '♔'}
                time={playerColor === 'white' ? blackTime : whiteTime}
                isCurrentPlayer={currentPlayer !== playerColor}
                formatTime={formatTime}
                difficulty={(isPlayingWithBot || isBotFromMatchmaking) ? getDifficultyLabel(difficulty) : undefined}
                rating={opponentRating}
                avatar={opponentAvatar}
                inactivityTimer={isOnlineReal && currentPlayer !== playerColor ? opponentInactivityTimer : undefined}
                capturedPieces={playerColor === 'white' ? capturedByBlack : capturedByWhite}
                theme={theme}
                onClickProfile={() => setShowOpponentProfile(true)}
              />
            </div>

            <GameBoard
              board={displayBoard}
              onSquareClick={handleSquareClick}
              isSquareSelected={isSquareSelected}
              isSquarePossibleMove={isSquarePossibleMove}
              kingInCheckPosition={kingInCheckPosition}
              showPossibleMoves={showPossibleMoves}
              flipped={flipped}
              boardTheme={boardTheme}
              lastMove={lastMove}
              gameResult={gameResult}
              onResultClick={() => setResultDismissed(true)}
            />

            <div className="flex flex-col gap-1 sm:gap-1.5">
              <PlayerInfo
                playerName="Вы"
                playerColor={playerColor}
                icon={playerColor === 'white' ? '♔' : '♚'}
                time={playerColor === 'white' ? whiteTime : blackTime}
                isCurrentPlayer={currentPlayer === playerColor}
                formatTime={formatTime}
                rating={newRating || userRating || undefined}
                ratingChange={ratingChange}
                avatar={userAvatar}
                inactivityTimer={currentPlayer === playerColor ? inactivityTimer : undefined}
                capturedPieces={playerColor === 'white' ? capturedByWhite : capturedByBlack}
                theme={theme}
                onClickProfile={() => setShowMyProfile(true)}
              />

              <MoveHistory
                moveHistory={moveHistory}
                currentMoveIndex={currentMoveIndex}
                isDragging={isDragging}
                onMouseDown={(e) => handleMouseDown(e, historyRef)}
                onMouseMove={(e) => handleMouseMove(e, historyRef)}
                onMouseUpOrLeave={handleMouseUpOrLeave}
                onPreviousMove={handlePreviousMove}
                onNextMove={handleNextMove}
                historyRef={historyRef}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </main>

      {showExitDialog && (
        <ExitDialog
          onContinue={handleContinue}
          onSurrender={handleSurrender}
        />
      )}

      {showChat && (
        <GameChatModal
          opponentName={(isPlayingWithBot || isBotFromMatchmaking) ? `${opponentName} (${getDifficultyLabel(difficulty)})` : opponentName}
          opponentIcon="♚"
          opponentInfo="Соперник"
          chatMessages={chatMessages}
          chatMessage={chatMessage}
          onChatMessageChange={setChatMessage}
          onSendMessage={handleSendMessage}
          onChatKeyPress={handleChatKeyPress}
          onBlock={handleBlockOpponent}
          onUnblock={handleUnblockOpponent}
          isBlocked={isChatBlocked}
          isBlockedByOpponent={isChatBlockedByOpponent}
          onClose={() => setShowChat(false)}
          chatEndRef={chatEndRef}
          theme={theme}
        />
      )}

      <DrawOfferModal
        showModal={showDrawOffer}
        onAccept={handleAcceptDraw}
        onDecline={handleDeclineDraw}
      />

      <NotificationsModal
        showModal={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <RematchModal
        showModal={showRematchOffer}
        onAccept={handleAcceptRematch}
        onDecline={handleDeclineRematch}
      />

      <OpponentLeftModal
        showModal={showOpponentLeft}
        onClose={() => setShowOpponentLeft(false)}
        isEarlyExit={opponentLeftReason === 'early'}
        isSurrender={opponentLeftReason === 'surrender'}
      />

      <PlayerProfileModal
        open={showOpponentProfile}
        onClose={() => setShowOpponentProfile(false)}
        playerName={opponentName}
        playerAvatar={opponentAvatar}
        playerRating={opponentRating}
      />

      <PlayerProfileModal
        open={showMyProfile}
        onClose={() => setShowMyProfile(false)}
        userId={myUserId}
        playerName={userData?.name || 'Вы'}
        playerAvatar={userAvatar}
        playerRating={newRating || userRating || undefined}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.message}
        title={confirmDialog.title}
        variant={confirmDialog.variant}
        alertOnly={confirmDialog.alertOnly}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={handleConfirmDialogCancel}
      />

      <ConfirmDialog
        open={!!rematchError}
        message={rematchError || ''}
        title="Реванш"
        variant="info"
        alertOnly
        onConfirm={() => setRematchError(null)}
        onCancel={() => setRematchError(null)}
      />
    </div>
  );
};

export default Game;