import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GameHeader } from './game/GameHeader';
import { GameLayout } from './game/GameLayout';
import { GameNetworkBanners } from './game/GameNetworkBanners';
import { GameModals } from './game/GameModals';
import { GameResult } from './game/GameBoard';
import { useGameLogic } from './game/useGameLogic';
import { useGameHandlers } from './game/useGameHandlers';
import { useRematch } from './game/useRematch';
import API from '@/config/api';

const BOT_AVATAR = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files/5a37bc71-a83e-4a96-b899-abd4e284ef6e.jpg';
const GUEST_AVATAR = '';

const Game = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const paramOpponentCity = searchParams.get('opponent_city') ? decodeURIComponent(searchParams.get('opponent_city')!) : '';

  const [playerColor] = useState<'white' | 'black'>(() => {
    if (colorParam === 'white') return 'white';
    if (colorParam === 'black') return 'black';
    return Math.random() < 0.5 ? 'white' : 'black';
  });

  const flipped = playerColor === 'black';
  const isPlayingWithBot = (!opponentType || opponentType === 'random' || opponentType === 'computer') && !isOnlineReal && !isBotFromMatchmaking;

  const savedUser = localStorage.getItem('chessUser');
  const userData = savedUser ? JSON.parse(savedUser) : null;
  const userAvatar = userData?.avatar || '';
  const myUserId = userData
    ? 'u_' + (userData.email || userData.name || 'anonymous').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60)
    : '';

  const opponentAvatar = isOnlineReal || isBotFromMatchmaking
    ? (paramOpponentAvatar || '')
    : isPlayingWithBot ? BOT_AVATAR : GUEST_AVATAR;
  const opponentName = isOnlineReal || isBotFromMatchmaking
    ? (paramOpponentName || 'Соперник')
    : isPlayingWithBot ? (paramOpponentName || 'Бот') : 'Соперник';
  const opponentRating = (isOnlineReal || isBotFromMatchmaking)
    ? (paramOpponentRating || undefined)
    : (isPlayingWithBot ? undefined : paramOpponentRating || undefined);

  // Wake lock — экран не гаснет во время партии
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    const request = async () => {
      try {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch { /* не поддерживается */ }
    };
    request();
    const onVisibility = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      wakeLockRef.current?.release();
    };
  }, []);

  const {
    displayBoard, currentPlayer, whiteTime, blackTime,
    gameStatus, setGameStatus, moveHistory, currentMoveIndex,
    inactivityTimer, opponentInactivityTimer,
    capturedByWhite, capturedByBlack,
    kingInCheckPosition, lastMove,
    endReason: serverEndReason,
    rematchOfferedBy, rematchStatus, rematchGameId, drawOfferedBy,
    setCurrentPlayer, showPossibleMoves, setShowPossibleMoves,
    theme, setTheme, boardTheme, setBoardTheme,
    ratingChange, newRating, userRating, opponentRatingAfter, diverseStreakTriggered, streakBonusAmount, streakCount,
    connectionLost, connectionRestored, opponentReconnecting,
    opponentUserId, p2pConnected, p2pLatency, p2pQuality,
    sendPeerMessage, onChatMessageRef, historyRef,
    handleSquareClick, isSquareSelected, isSquarePossibleMove,
    handlePreviousMove, handleNextMove,
  } = useGameLogic(
    difficulty, timeControl, playerColor,
    isOnlineReal ? Number(onlineGameId) : undefined,
    isBotFromMatchmaking,
    paramOpponentName || 'Бот',
    paramOpponentRating || undefined
  );

  const {
    isDragging, showExitDialog, showChat, setShowChat,
    showSettingsMenu, setShowSettingsMenu,
    showDrawOffer, setShowDrawOffer,
    showNotifications, setShowNotifications,
    showRematchOffer, setShowRematchOffer,
    showOpponentLeft, setShowOpponentLeft, opponentLeftReason,
    chatMessage, setChatMessage, chatMessages, chatEndRef,
    handleMouseDown, handleMouseMove, handleMouseUpOrLeave,
    handleExitClick, handleSurrender, handleContinue,
    handleSendMessage, handleChatKeyPress,
    handleBlockOpponent, handleUnblockOpponent,
    isChatBlocked, isChatBlockedByOpponent,
    handleOfferDraw, handleAcceptDraw, handleDeclineDraw,
    handleNewGame, handleAcceptRematch, handleDeclineRematch,
    handleOfferRematch,
    confirmDialog, handleConfirmDialogConfirm, handleConfirmDialogCancel,
    openChat, unreadChatCount,
  } = useGameHandlers(
    gameStatus, setGameStatus, moveHistory.length, playerColor, setCurrentPlayer,
    isOnlineReal ? Number(onlineGameId) : undefined,
    isOnlineReal ? API.onlineMove : undefined,
    isOnlineReal ? sendPeerMessage : undefined,
    isOnlineReal ? onChatMessageRef : undefined,
    isOnlineReal ? opponentUserId : undefined,
  );

  const { rematchSent, rematchCooldown, rematchError, rematchTimeoutLeft, setRematchError, offerRematch, botRematchPending, cancelBotRematch } = useRematch({
    isOnline: isOnlineReal,
    isBotMatchmaking: isBotFromMatchmaking,
    opponentUserId,
    timeControl,
    playerColor,
    opponentName,
    opponentRating,
    opponentAvatar,
    myUserId,
    difficulty,
    handleOfferRematch,
  });

  // Синхронизация состояния партии в localStorage
  useEffect(() => {
    localStorage.setItem('currentGameFinished', gameStatus !== 'playing' ? '1' : '');
  }, [gameStatus]);

  useEffect(() => {
    if (isOnlineReal && onlineGameId && gameStatus === 'playing') {
      localStorage.setItem('activeOnlineGame', JSON.stringify({
        gameId: onlineGameId, color: playerColor,
        opponentName, opponentAvatar, opponentRating,
        url: window.location.pathname + window.location.search,
      }));
    } else if (isOnlineReal && gameStatus !== 'playing') {
      localStorage.removeItem('activeOnlineGame');
    }
  }, [gameStatus, isOnlineReal, onlineGameId]);

  useEffect(() => {
    return () => { localStorage.removeItem('currentGameFinished'); };
  }, []);

  // Для офлайн-игр (компьютер / друг локально) — обогащаем activeGame данными об оппоненте
  useEffect(() => {
    if (isOnlineReal) return;
    if (gameStatus !== 'playing') return;
    const saved = localStorage.getItem('activeGame');
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      const enriched = {
        ...state,
        playerColor,
        opponentName,
        opponentAvatar,
        opponentType: isPlayingWithBot || isBotFromMatchmaking ? 'bot' : 'friend',
      };
      localStorage.setItem('activeGame', JSON.stringify(enriched));
    } catch { /* ignore */ }
  }, [gameStatus, isOnlineReal, playerColor, opponentName, opponentAvatar]);

  // Показываем модалку реванша когда соперник предлагает
  useEffect(() => {
    if (!isOnlineReal || !rematchOfferedBy || rematchStatus !== 'pending') return;
    if (rematchOfferedBy === myUserId) return;
    setShowRematchOffer(true);
  }, [rematchOfferedBy, rematchStatus]);

  // Показываем модалку ничьей
  useEffect(() => {
    if (!isOnlineReal || !drawOfferedBy || drawOfferedBy === myUserId) return;
    setShowDrawOffer(true);
  }, [drawOfferedBy]);

  // Переход в новую партию реванша (старый механизм через polling игры)
  useEffect(() => {
    if (!isOnlineReal || !rematchGameId || rematchStatus !== 'accepted') return;
    const newColor = playerColor === 'white' ? 'black' : 'white';
    const params = new URLSearchParams(window.location.search);
    params.set('online_game_id', String(rematchGameId));
    params.set('color', newColor);
    params.set('online', 'true');
    window.location.href = `/game?${params.toString()}`;
  }, [rematchGameId, rematchStatus]);

  const isViewingHistory = currentMoveIndex < moveHistory.length;

  const [resultDismissed, setResultDismissed] = useState(false);
  useEffect(() => {
    setResultDismissed(isViewingHistory);
  }, [isViewingHistory]);

  const gameResult: GameResult = (() => {
    if (showRematchOffer || resultDismissed || gameStatus === 'playing') return null;
    if (gameStatus === 'draw' || gameStatus === 'stalemate') return 'draw';
    if (gameStatus === 'checkmate') {
      const iWon = currentPlayer !== playerColor;
      if (iWon && serverEndReason === 'resign') return 'opponent_resigned';
      return iWon ? 'win' : 'loss';
    }
    return null;
  })();

  const [showOpponentProfile, setShowOpponentProfile] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);

  return (
    <div
      onClick={() => { if (gameResult) setResultDismissed(true); }}
      className={`h-[100dvh] flex flex-col transition-colors overflow-hidden ${
        theme === 'light'
          ? 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'
          : 'bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950'
      }`}
    >
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

      <GameNetworkBanners
        isOnlineReal={isOnlineReal}
        connectionLost={connectionLost}
        connectionRestored={connectionRestored}
        opponentReconnecting={opponentReconnecting}
        gameStatus={gameStatus}
        diverseStreakTriggered={diverseStreakTriggered}
        streakCount={streakCount}
        streakBonusAmount={streakBonusAmount}
      />

      <GameLayout
        theme={theme}
        boardTheme={boardTheme}
        setBoardTheme={setBoardTheme}
        setTheme={setTheme}
        displayBoard={displayBoard}
        handleSquareClick={handleSquareClick}
        isSquareSelected={isSquareSelected}
        isSquarePossibleMove={isSquarePossibleMove}
        kingInCheckPosition={kingInCheckPosition}
        showPossibleMoves={showPossibleMoves}
        setShowPossibleMoves={setShowPossibleMoves}
        flipped={flipped}
        lastMove={lastMove}
        gameResult={gameResult}
        setResultDismissed={setResultDismissed}
        gameStatus={gameStatus}
        currentPlayer={currentPlayer}
        playerColor={playerColor}
        whiteTime={whiteTime}
        blackTime={blackTime}
        moveHistory={moveHistory}
        currentMoveIndex={currentMoveIndex}
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
        inactivityTimer={inactivityTimer}
        opponentInactivityTimer={opponentInactivityTimer}
        opponentName={opponentName}
        opponentAvatar={opponentAvatar}
        opponentRating={opponentRating}
        opponentRatingAfter={opponentRatingAfter}
        paramOpponentCity={paramOpponentCity}
        isPlayingWithBot={isPlayingWithBot}
        isBotFromMatchmaking={isBotFromMatchmaking}
        isOnlineReal={isOnlineReal}
        difficulty={difficulty}
        userData={userData}
        userAvatar={userAvatar}
        newRating={newRating}
        userRating={userRating}
        ratingChange={ratingChange}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        openChat={openChat}
        unreadChatCount={unreadChatCount}
        handleExitClick={handleExitClick}
        handleOfferDraw={handleOfferDraw}
        handleSurrender={handleSurrender}
        handleNewGame={handleNewGame}
        setShowNotifications={setShowNotifications}
        setShowRematchOffer={setShowRematchOffer}
        offerRematch={offerRematch}
        rematchSent={rematchSent}
        rematchCooldown={rematchCooldown}
        rematchTimeoutLeft={rematchTimeoutLeft}
        onNewOnlineGame={() => navigate(`/online-game?opponent=country&time=${encodeURIComponent(timeControl)}&color=random`)}
        p2pConnected={p2pConnected}
        p2pQuality={p2pQuality}
        p2pLatency={p2pLatency}
        connectionLost={connectionLost}
        isComputerGame={isPlayingWithBot}
        isBotGame={isBotFromMatchmaking}
        isDragging={isDragging}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUpOrLeave={handleMouseUpOrLeave}
        handlePreviousMove={handlePreviousMove}
        handleNextMove={handleNextMove}
        historyRef={historyRef}
        setShowOpponentProfile={setShowOpponentProfile}
        setShowMyProfile={setShowMyProfile}
      />

      <GameModals
        showExitDialog={showExitDialog}
        handleContinue={handleContinue}
        handleSurrender={handleSurrender}
        showChat={showChat}
        setShowChat={setShowChat}
        isPlayingWithBot={isPlayingWithBot}
        isBotFromMatchmaking={isBotFromMatchmaking}
        opponentName={opponentName}
        difficulty={difficulty}
        chatMessages={chatMessages}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        handleSendMessage={handleSendMessage}
        handleChatKeyPress={handleChatKeyPress}
        handleBlockOpponent={handleBlockOpponent}
        handleUnblockOpponent={handleUnblockOpponent}
        isChatBlocked={isChatBlocked}
        isChatBlockedByOpponent={isChatBlockedByOpponent}
        chatEndRef={chatEndRef}
        theme={theme}
        showDrawOffer={showDrawOffer}
        handleAcceptDraw={handleAcceptDraw}
        handleDeclineDraw={handleDeclineDraw}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showRematchOffer={showRematchOffer}
        handleAcceptRematch={handleAcceptRematch}
        handleDeclineRematch={handleDeclineRematch}
        botRematchPending={botRematchPending}
        opponentAvatar={opponentAvatar}
        cancelBotRematch={cancelBotRematch}
        showOpponentLeft={showOpponentLeft}
        setShowOpponentLeft={setShowOpponentLeft}
        opponentLeftReason={opponentLeftReason}
        showOpponentProfile={showOpponentProfile}
        setShowOpponentProfile={setShowOpponentProfile}
        showMyProfile={showMyProfile}
        setShowMyProfile={setShowMyProfile}
        playerName={opponentName}
        playerAvatar={opponentAvatar}
        opponentRating={opponentRating}
        myUserId={myUserId}
        userData={userData}
        userAvatar={userAvatar}
        newRating={newRating}
        userRating={userRating}
        confirmDialog={confirmDialog}
        handleConfirmDialogConfirm={handleConfirmDialogConfirm}
        handleConfirmDialogCancel={handleConfirmDialogCancel}
        rematchError={rematchError}
        setRematchError={setRematchError}
      />
    </div>
  );
};

export default Game;