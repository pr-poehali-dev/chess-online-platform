import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Board, Position, initialBoard, getInitialTime, getDifficultyLabel, formatTime } from './game/gameTypes';
import { getPossibleMoves, getAllPossibleMovesForBoard, getBestMove } from './game/gameLogic';
import { GameBoard } from './game/GameBoard';
import { PlayerInfo } from './game/PlayerInfo';
import { MoveHistory } from './game/MoveHistory';
import { ExitDialog } from './game/ExitDialog';
import { GameChatModal } from './game/GameChatModal';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'medium') as 'easy' | 'medium' | 'hard' | 'master';
  const timeControl = (searchParams.get('time') || 'blitz') as 'blitz' | 'rapid' | 'classic';

  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [whiteTime, setWhiteTime] = useState(getInitialTime(timeControl));
  const [blackTime, setBlackTime] = useState(getInitialTime(timeControl));
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [boardHistory, setBoardHistory] = useState<Board[]>([initialBoard]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [displayBoard, setDisplayBoard] = useState<Board>(initialBoard);
  const historyRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isOwn: boolean; time: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      if (currentPlayer === 'white') {
        setWhiteTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus]);

  useEffect(() => {
    if (currentPlayer === 'black' && gameStatus === 'playing') {
      setCurrentMoveIndex(boardHistory.length - 1);
      setDisplayBoard(board);
      setTimeout(() => makeComputerMove(), 500);
    }
  }, [currentPlayer, gameStatus]);

  useEffect(() => {
    setDisplayBoard(boardHistory[currentMoveIndex] || initialBoard);
  }, [currentMoveIndex]);

  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    const moveNotation = `${String.fromCharCode(97 + from.col)}${8 - from.row}-${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const newMoveHistory = [...moveHistory, moveNotation];
    const newBoardHistory = [...boardHistory, newBoard];
    
    setMoveHistory(newMoveHistory);
    setBoardHistory(newBoardHistory);
    
    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollLeft = historyRef.current.scrollWidth;
      }
    }, 10);

    setBoard(newBoard);
    setDisplayBoard(newBoard);
    setCurrentMoveIndex(newMoveHistory.length - 1);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
  };

  const makeComputerMove = () => {
    const moves = getAllPossibleMovesForBoard(board, 'black');
    if (moves.length === 0) {
      setGameStatus('checkmate');
      return;
    }

    let selectedMove;
    switch (difficulty) {
      case 'easy':
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
        break;
      case 'medium':
        selectedMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];
        break;
      case 'hard':
        selectedMove = getBestMove(board, moves, false);
        break;
      case 'master':
        selectedMove = getBestMove(board, moves, true);
        break;
      default:
        selectedMove = moves[0];
    }

    makeMove(selectedMove.from, selectedMove.to);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (currentPlayer !== 'white' || gameStatus !== 'playing') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const isValidTarget = possibleMoves.some(m => m.row === row && m.col === col);
      
      if (isValidTarget) {
        makeMove(selectedSquare, { row, col });
      } else if (piece && piece.color === 'white') {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(board, { row, col }));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === 'white') {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(board, { row, col }));
    }
  };

  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isSquarePossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(m => m.row === row && m.col === col);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!historyRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - historyRef.current.offsetLeft);
    setScrollLeft(historyRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
      setShowExitDialog(true);
    }
  };

  const handleSurrender = () => {
    setGameStatus('checkmate');
    setShowExitDialog(false);
  };

  const handleContinue = () => {
    setShowExitDialog(false);
  };

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < boardHistory.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
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
    if (confirm('Предложить ничью сопернику?')) {
      setGameStatus('draw');
    }
  };

  const handleNewGame = () => {
    setShowSettingsMenu(false);
    if (confirm('Начать новую партию? Текущая партия будет завершена.')) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col">
      <header className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50 px-4 py-3 flex items-center justify-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-wide" style={{
          fontFamily: 'Montserrat, sans-serif',
          textShadow: '0 2px 10px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2)',
          letterSpacing: '0.05em'
        }}>
          ЛигаШахмат
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4">
        <div className="flex flex-col gap-3 md:gap-6 w-full max-w-[1200px] items-center">
            <div className="flex gap-3">
              <button
                onClick={handleExitClick}
                className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
                title="Выход из игры"
              >
                <Icon name="LogOut" size={24} />
              </button>
              <button
                onClick={() => setShowChat(true)}
                className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
                title="Чат"
              >
                <Icon name="MessageCircle" size={24} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
                  title="Опции"
                >
                  <Icon name="Settings" size={24} />
                </button>
                {showSettingsMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSettingsMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-stone-800 rounded-lg shadow-xl border border-stone-700/50 overflow-hidden z-50 animate-scale-in">
                      <button
                        onClick={handleOfferDraw}
                        className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100"
                      >
                        <Icon name="Handshake" size={20} />
                        <span>Предложить ничью</span>
                      </button>
                      <button
                        onClick={handleSurrender}
                        className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100 border-t border-stone-700/50"
                      >
                        <Icon name="Flag" size={20} />
                        <span>Сдаться</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          navigate('/?section=notifications');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100 border-t border-stone-700/50"
                      >
                        <Icon name="Bell" size={20} />
                        <span>Уведомления</span>
                      </button>
                      <button
                        onClick={handleNewGame}
                        className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3 text-stone-300 hover:text-stone-100 border-t border-stone-700/50"
                      >
                        <Icon name="Plus" size={20} />
                        <span>Новая партия</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <PlayerInfo
              playerName="Компьютер"
              playerColor="black"
              icon="♚"
              time={blackTime}
              isCurrentPlayer={currentPlayer === 'black'}
              formatTime={formatTime}
              difficulty={getDifficultyLabel(difficulty)}
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
            />

            {gameStatus !== 'playing' && (
              <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-500/50 w-full max-w-[400px]">
                <div className="text-lg font-bold text-white">
                  {gameStatus === 'checkmate' && currentPlayer === 'white' && 'Вы проиграли!'}
                  {gameStatus === 'checkmate' && currentPlayer === 'black' && 'Вы победили!'}
                  {gameStatus === 'stalemate' && 'Ничья - пат'}
                  {gameStatus === 'draw' && 'Ничья'}
                </div>
              </div>
            )}

          <MoveHistory
            moveHistory={moveHistory}
            currentMoveIndex={currentMoveIndex}
            isDragging={isDragging}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
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
          opponentName={`Компьютер (${getDifficultyLabel(difficulty)})`}
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
    </div>
  );
};

export default Game;