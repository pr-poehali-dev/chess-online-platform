import type React from 'react';
import Icon from '@/components/ui/icon';
import { ExitDialog } from './ExitDialog';
import { GameChatModal } from './GameChatModal';
import { DrawOfferModal } from './DrawOfferModal';
import { NotificationsModal } from './NotificationsModal';
import { RematchModal } from './RematchModal';
import { OpponentLeftModal } from './OpponentLeftModal';
import { ConfirmDialog } from './ConfirmDialog';
import PlayerProfileModal from '@/components/chess/PlayerProfileModal';
import type { ConfirmState } from './useGameHandlers';
import { getDifficultyLabel } from './gameTypes';

interface GameModalsProps {
  // ExitDialog
  showExitDialog: boolean;
  handleContinue: () => void;
  handleSurrender: () => void;

  // Chat
  showChat: boolean;
  setShowChat: (v: boolean) => void;
  isPlayingWithBot: boolean;
  isBotFromMatchmaking: boolean;
  opponentName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  chatMessages: Array<{ id: string; text: string; isOwn: boolean; time: string }>;
  chatMessage: string;
  setChatMessage: (v: string) => void;
  handleSendMessage: () => void;
  handleChatKeyPress: (e: React.KeyboardEvent) => void;
  handleBlockOpponent: () => void;
  handleUnblockOpponent: () => void;
  isChatBlocked: boolean;
  isChatBlockedByOpponent: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  theme: 'light' | 'dark';

  // DrawOffer
  showDrawOffer: boolean;
  handleAcceptDraw: () => void;
  handleDeclineDraw: () => void;

  // Notifications
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;

  // Rematch
  showRematchOffer: boolean;
  handleAcceptRematch: () => void;
  handleDeclineRematch: () => void;

  // Bot rematch pending
  botRematchPending: boolean;
  opponentAvatar: string;
  cancelBotRematch: () => void;

  // OpponentLeft
  showOpponentLeft: boolean;
  setShowOpponentLeft: (v: boolean) => void;
  opponentLeftReason: 'early' | 'surrender' | 'exit';

  // Player profiles
  showOpponentProfile: boolean;
  setShowOpponentProfile: (v: boolean) => void;
  showMyProfile: boolean;
  setShowMyProfile: (v: boolean) => void;
  playerName: string;
  playerAvatar: string;
  opponentRating?: number;
  myUserId: string;
  userData: { name?: string; avatar?: string } | null;
  userAvatar: string;
  newRating: number | null;
  userRating: number | null;

  // Confirm dialogs
  confirmDialog: ConfirmState;
  handleConfirmDialogConfirm: () => void;
  handleConfirmDialogCancel: () => void;
  rematchError: string | null;
  setRematchError: (v: string | null) => void;
}

export const GameModals = ({
  showExitDialog, handleContinue, handleSurrender,
  showChat, setShowChat, isPlayingWithBot, isBotFromMatchmaking, opponentName, difficulty,
  chatMessages, chatMessage, setChatMessage, handleSendMessage, handleChatKeyPress,
  handleBlockOpponent, handleUnblockOpponent, isChatBlocked, isChatBlockedByOpponent,
  chatEndRef, theme,
  showDrawOffer, handleAcceptDraw, handleDeclineDraw,
  showNotifications, setShowNotifications,
  showRematchOffer, handleAcceptRematch, handleDeclineRematch,
  botRematchPending, opponentAvatar, cancelBotRematch,
  showOpponentLeft, setShowOpponentLeft, opponentLeftReason,
  showOpponentProfile, setShowOpponentProfile,
  showMyProfile, setShowMyProfile,
  playerName, playerAvatar, opponentRating,
  myUserId, userData, userAvatar, newRating, userRating,
  confirmDialog, handleConfirmDialogConfirm, handleConfirmDialogCancel,
  rematchError, setRematchError,
}: GameModalsProps) => {
  return (
    <>
      {showExitDialog && <ExitDialog onContinue={handleContinue} onSurrender={handleSurrender} />}

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

      <DrawOfferModal showModal={showDrawOffer} onAccept={handleAcceptDraw} onDecline={handleDeclineDraw} />

      <NotificationsModal showModal={showNotifications} onClose={() => setShowNotifications(false)} />

      <RematchModal showModal={showRematchOffer} onAccept={handleAcceptRematch} onDecline={handleDeclineRematch} />

      {botRematchPending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-sm bg-stone-800 border border-stone-700/50 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="relative">
              {opponentAvatar ? (
                <img src={opponentAvatar} alt={opponentName} className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-400/50" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center ring-2 ring-amber-400/50">
                  <Icon name="User" size={28} className="text-stone-400" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center">
                <Icon name="Loader2" size={14} className="text-amber-400 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Запрос на реванш отправлен</p>
              <p className="text-stone-400 text-sm mt-1">{opponentName} думает над предложением...</p>
            </div>
            <button onClick={cancelBotRematch} className="mt-1 px-4 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}

      <OpponentLeftModal
        showModal={showOpponentLeft}
        onClose={() => setShowOpponentLeft(false)}
        isEarlyExit={opponentLeftReason === 'early'}
        isSurrender={opponentLeftReason === 'surrender'}
      />

      <PlayerProfileModal
        open={showOpponentProfile}
        onClose={() => setShowOpponentProfile(false)}
        playerName={playerName}
        playerAvatar={playerAvatar}
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
    </>
  );
};
