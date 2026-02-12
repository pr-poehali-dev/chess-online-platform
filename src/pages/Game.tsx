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
import { GameHeader } from './game/GameHeader';
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
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col">
      <GameHeader
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        setShowChat={setShowChat}
        handleExitClick={handleExitClick}
        handleOfferDraw={handleOfferDraw}
        handleSurrender={handleSurrender}
        handleNewGame={handleNewGame}
        setShowNotifications={setShowNotifications}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 overflow-y-auto">
        <div className="flex flex-col gap-3 md:gap-6 w-full max-w-[1200px] items-center min-h-0">
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
          />

          <GameBoard
            board={displayBoard}
            onSquareClick={handleSquareClick}
            isSquareSelected={isSquareSelected}
            isSquarePossibleMove={isSquarePossibleMove}
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
          />

          {gameStatus !== 'playing' && (
            <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-500/50 w-full max-w-[400px] space-y-4">
              <div className="text-lg font-bold text-white">
                {gameStatus === 'checkmate' && currentPlayer === 'white' && 'Вы проиграли!'}
                {gameStatus === 'checkmate' && currentPlayer === 'black' && 'Вы победили!'}
                {gameStatus === 'stalemate' && 'Ничья - пат'}
                {gameStatus === 'draw' && 'Ничья'}
              </div>
              <button
                onClick={() => {
                  setTimeout(() => {
                    setShowRematchOffer(true);
                  }, 1000);
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
              >
                <Icon name="RotateCcw" size={20} />
                Предложить реванш
              </button>
            </div>
          )}

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
          />
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