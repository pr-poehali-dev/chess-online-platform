import { useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { getDifficultyLabel, formatTime } from './game/gameTypes';
import { GameBoard } from './game/GameBoard';
import { PlayerInfo } from './game/PlayerInfo';
import { MoveHistory } from './game/MoveHistory';
import { ExitDialog } from './game/ExitDialog';
import { GameChatModal } from './game/GameChatModal';
import { DrawOfferModal } from './game/DrawOfferModal';
import { NotificationsModal } from './game/NotificationsModal';
import { RematchModal } from './game/RematchModal';
import { GameHeader, GameControls } from './game/GameHeader';
import { useGameLogic } from './game/useGameLogic';
import { useGameHandlers } from './game/useGameHandlers';

const Game = () => {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'medium') as 'easy' | 'medium' | 'hard' | 'master';
  const timeControl = (searchParams.get('time') || 'blitz') as 'blitz' | 'rapid' | 'classic';
  const opponentType = searchParams.get('opponent');

  const savedUser = localStorage.getItem('chessUser');
  const userData = savedUser ? JSON.parse(savedUser) : null;
  const userAvatar = userData?.avatar || '';
  const userRating = 1842;

  const isPlayingWithBot = !opponentType || opponentType === 'random';
  
  const botAvatar = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files/5a37bc71-a83e-4a96-b899-abd4e284ef6e.jpg';
  const opponentAvatar = isPlayingWithBot ? botAvatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent';
  const opponentName = isPlayingWithBot ? 'Бот' : 'Игорь Соколов';
  const opponentRating = isPlayingWithBot ? undefined : 2123;

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
    capturedByWhite,
    capturedByBlack,
    kingInCheckPosition,
    showPossibleMoves,
    setShowPossibleMoves,
    theme,
    setTheme,
    historyRef,
    handleSquareClick,
    isSquareSelected,
    isSquarePossibleMove,
    handlePreviousMove,
    handleNextMove
  } = useGameLogic(difficulty, timeControl);

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
  } = useGameHandlers(gameStatus, setGameStatus);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
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
      />

      <main className="flex-1 flex items-center justify-center p-2 md:p-3 overflow-y-auto md:overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col gap-1.5 md:gap-2 w-full max-w-[calc(100vw-16px)] md:max-w-none md:w-auto">
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
              gameStatus={gameStatus}
              currentPlayer={currentPlayer}
              setShowRematchOffer={setShowRematchOffer}
            />

            <PlayerInfo
              playerName={opponentName}
              playerColor="black"
              icon="♚"
              time={blackTime}
              isCurrentPlayer={currentPlayer === 'black'}
              formatTime={formatTime}
              difficulty={isPlayingWithBot ? getDifficultyLabel(difficulty) : undefined}
              rating={opponentRating}
              avatar={opponentAvatar}
              capturedPieces={capturedByBlack}
              theme={theme}
            />

            <GameBoard
              board={displayBoard}
              onSquareClick={handleSquareClick}
              isSquareSelected={isSquareSelected}
              isSquarePossibleMove={isSquarePossibleMove}
              kingInCheckPosition={kingInCheckPosition}
              showPossibleMoves={showPossibleMoves}
            />

            <PlayerInfo
              playerName="Вы"
              playerColor="white"
              icon="♔"
              time={whiteTime}
              isCurrentPlayer={currentPlayer === 'white'}
              formatTime={formatTime}
              rating={userRating}
              avatar={userAvatar}
              inactivityTimer={currentPlayer === 'white' ? inactivityTimer : undefined}
              capturedPieces={capturedByWhite}
              theme={theme}
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
      </main>

      {showExitDialog && (
        <ExitDialog
          onContinue={handleContinue}
          onSurrender={handleSurrender}
        />
      )}

      {showChat && (
        <GameChatModal
          opponentName={isPlayingWithBot ? `${opponentName} (${getDifficultyLabel(difficulty)})` : opponentName}
          opponentIcon="♚"
          opponentInfo="Соперник"
          chatMessages={chatMessages}
          chatMessage={chatMessage}
          onChatMessageChange={setChatMessage}
          onSendMessage={handleSendMessage}
          onChatKeyPress={handleChatKeyPress}
          onBlock={handleBlockOpponent}
          onClose={() => setShowChat(false)}
          chatEndRef={chatEndRef}
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
    </div>
  );
};

export default Game;