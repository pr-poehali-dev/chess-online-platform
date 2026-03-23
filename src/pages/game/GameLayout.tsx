import type React from 'react';
import { getDifficultyLabel, formatTime, BoardTheme } from './gameTypes';
import { GameBoard, GameResult } from './GameBoard';
import { PlayerInfo } from './PlayerInfo';
import { MoveHistory } from './MoveHistory';
import { GameControls } from './GameHeader';
import type { Board, Position } from './gameTypes';
import type { P2PQuality } from './usePeerConnection';

interface GameLayoutProps {
  // Theme
  theme: 'light' | 'dark';
  boardTheme: BoardTheme;
  setBoardTheme: (v: BoardTheme) => void;
  setTheme: (v: 'light' | 'dark') => void;

  // Board
  displayBoard: Board;
  handleSquareClick: (row: number, col: number) => void;
  isSquareSelected: (row: number, col: number) => boolean;
  isSquarePossibleMove: (row: number, col: number) => boolean;
  kingInCheckPosition: Position | null;
  showPossibleMoves: boolean;
  setShowPossibleMoves: (v: boolean) => void;
  flipped: boolean;
  lastMove: { from: Position; to: Position } | null;
  gameResult: GameResult;
  setResultDismissed: (v: boolean) => void;

  // Game state
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  currentPlayer: 'white' | 'black';
  playerColor: 'white' | 'black';
  whiteTime: number;
  blackTime: number;
  moveHistory: string[];
  currentMoveIndex: number;
  capturedByWhite: { type: string; color: string }[];
  capturedByBlack: { type: string; color: string }[];
  inactivityTimer: number;
  opponentInactivityTimer: number;

  // Opponent info
  opponentName: string;
  opponentAvatar: string;
  opponentRating?: number;
  opponentRatingAfter: number | null;
  paramOpponentCity: string;
  isPlayingWithBot: boolean;
  isBotFromMatchmaking: boolean;
  isOnlineReal: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'master';

  // My info
  userData: { name?: string; city?: string } | null;
  userAvatar: string;
  newRating: number | null;
  userRating: number | null;
  ratingChange: number | null;

  // Controls
  showSettingsMenu: boolean;
  setShowSettingsMenu: (v: boolean) => void;
  openChat: () => void;
  unreadChatCount: number;
  handleExitClick: () => void;
  handleOfferDraw: () => void;
  handleSurrender: () => void;
  handleNewGame: () => void;
  setShowNotifications: (v: boolean) => void;
  setShowRematchOffer: (v: boolean) => void;
  offerRematch: () => void;
  rematchSent: boolean;
  rematchCooldown: boolean;
  rematchTimeoutLeft: number | null;
  onNewOnlineGame: () => void;
  p2pConnected: boolean;
  p2pQuality: P2PQuality;
  p2pLatency: number | null;
  connectionLost: boolean;
  isComputerGame: boolean;
  isBotGame: boolean;

  // Move history drag
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => void;
  handleMouseUpOrLeave: () => void;
  handlePreviousMove: () => void;
  handleNextMove: () => void;
  historyRef: React.RefObject<HTMLDivElement>;

  // Profile modals
  setShowOpponentProfile: (v: boolean) => void;
  setShowMyProfile: (v: boolean) => void;
}

export const GameLayout = ({
  theme, boardTheme, setBoardTheme, setTheme,
  displayBoard, handleSquareClick, isSquareSelected, isSquarePossibleMove,
  kingInCheckPosition, showPossibleMoves, setShowPossibleMoves,
  flipped, lastMove, gameResult, setResultDismissed,
  gameStatus, currentPlayer, playerColor,
  whiteTime, blackTime, moveHistory, currentMoveIndex,
  capturedByWhite, capturedByBlack, inactivityTimer, opponentInactivityTimer,
  opponentName, opponentAvatar, opponentRating, opponentRatingAfter,
  paramOpponentCity, isPlayingWithBot, isBotFromMatchmaking, isOnlineReal, difficulty,
  userData, userAvatar, newRating, userRating, ratingChange,
  showSettingsMenu, setShowSettingsMenu, openChat, unreadChatCount,
  handleExitClick, handleOfferDraw, handleSurrender, handleNewGame,
  setShowNotifications, setShowRematchOffer, offerRematch,
  rematchSent, rematchCooldown, rematchTimeoutLeft, onNewOnlineGame,
  p2pConnected, p2pQuality, p2pLatency, connectionLost, isComputerGame, isBotGame,
  isDragging, handleMouseDown, handleMouseMove, handleMouseUpOrLeave,
  handlePreviousMove, handleNextMove, historyRef,
  setShowOpponentProfile, setShowMyProfile,
}: GameLayoutProps) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center py-0.5 px-1 sm:px-2 overflow-visible min-h-0">
      <div className="flex flex-col gap-0.5 sm:gap-1 w-full" style={{ maxWidth: 'min(100%, min(100vw - 8px, 100dvh - 250px))' }}>

        {/* Верхняя панель + противник */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <GameControls
            showSettingsMenu={showSettingsMenu}
            setShowSettingsMenu={setShowSettingsMenu}
            setShowChat={openChat}
            unreadChatCount={unreadChatCount}
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
            onOfferRematch={offerRematch}
            rematchSent={rematchSent}
            rematchCooldown={rematchCooldown}
            rematchTimeoutLeft={rematchTimeoutLeft}
            isOnline={isOnlineReal || isBotFromMatchmaking}
            isComputerGame={isComputerGame}
            isBotGame={isBotGame}
            onNewOnlineGame={onNewOnlineGame}
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
            difficulty={isPlayingWithBot ? getDifficultyLabel(difficulty) : undefined}
            rating={opponentRatingAfter ?? opponentRating}
            ratingChange={opponentRatingAfter != null && opponentRating != null ? opponentRatingAfter - opponentRating : undefined}
            city={(isOnlineReal || isBotFromMatchmaking) ? paramOpponentCity : undefined}
            avatar={opponentAvatar}
            inactivityTimer={isOnlineReal && currentPlayer !== playerColor ? opponentInactivityTimer : undefined}
            capturedPieces={playerColor === 'white' ? capturedByBlack : capturedByWhite}
            theme={theme}
            onClickProfile={() => setShowOpponentProfile(true)}
          />
        </div>

        {/* Доска */}
        <div style={{ width: '100%', margin: '0 auto' }}>
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
        </div>

        {/* Нижняя панель + игрок */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <PlayerInfo
            playerName={userData?.name || 'Вы'}
            playerColor={playerColor}
            icon={playerColor === 'white' ? '♔' : '♚'}
            time={playerColor === 'white' ? whiteTime : blackTime}
            isCurrentPlayer={currentPlayer === playerColor}
            formatTime={formatTime}
            rating={newRating || userRating || undefined}
            ratingChange={ratingChange}
            city={(isOnlineReal || isBotFromMatchmaking) ? (userData?.city || undefined) : undefined}
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
    </main>
  );
};
