import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Board, Position, initialBoard, getInitialTime, getDifficultyLabel, formatTime } from './game/gameTypes';
import { getPossibleMoves, getAllPossibleMovesForBoard, getBestMove } from './game/gameLogic';
import { GameBoard } from './game/GameBoard';

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
              <button
                className="p-4 md:p-3 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
                title="Опции"
              >
                <Icon name="Settings" size={24} />
              </button>
            </div>

            <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-stone-700/30 w-full max-w-[400px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-3xl md:text-4xl">♚</div>
                  <div>
                    <div className="text-xs md:text-sm font-medium text-stone-200">
                      Компьютер ({getDifficultyLabel(difficulty)})
                    </div>
                    <div className="text-xs text-stone-400">Черные</div>
                  </div>
                </div>
                <div className={`text-xl md:text-2xl font-bold ${currentPlayer === 'black' ? 'text-green-400' : 'text-stone-400'}`}>
                  {formatTime(blackTime)}
                </div>
              </div>
            </div>

            <GameBoard
              board={displayBoard}
              onSquareClick={handleSquareClick}
              isSquareSelected={isSquareSelected}
              isSquarePossibleMove={isSquarePossibleMove}
            />

            <div className="bg-stone-800/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-stone-700/30 w-full max-w-[400px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-3xl md:text-4xl">♔</div>
                  <div>
                    <div className="text-xs md:text-sm font-medium text-stone-200">Вы</div>
                    <div className="text-xs text-stone-400">Белые</div>
                  </div>
                </div>
                <div className={`text-xl md:text-2xl font-bold ${currentPlayer === 'white' ? 'text-green-400' : 'text-stone-400'}`}>
                  {formatTime(whiteTime)}
                </div>
              </div>
            </div>

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

          <div className="w-full max-w-[400px] flex flex-col gap-2">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-900 to-transparent z-10 pointer-events-none"></div>
              <div 
                ref={historyRef} 
                className="overflow-x-auto hide-scrollbar bg-stone-800/50 backdrop-blur-sm rounded-lg border border-stone-700/30 p-1.5"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
              >
                <div className={`flex gap-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                  {moveHistory.length === 0 ? (
                    <div className="text-[10px] text-stone-500 whitespace-nowrap">
                      Ходы появятся здесь
                    </div>
                  ) : (
                    moveHistory.map((move, index) => (
                      <div 
                        key={index} 
                        className={`whitespace-nowrap flex-shrink-0 transition-all ${
                          index === currentMoveIndex ? 'text-white font-semibold text-[12px]' : 'text-stone-300 text-[10px]'
                        }`}
                      >
                        <span className="text-stone-500 mr-0.5">{Math.floor(index / 2) + 1}.</span>
                        {move}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={handlePreviousMove}
                disabled={currentMoveIndex === 0}
                className="p-2 bg-stone-800/50 hover:bg-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100"
                title="Предыдущий ход"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <button
                onClick={handleNextMove}
                disabled={currentMoveIndex === boardHistory.length - 1}
                className="p-2 bg-stone-800/50 hover:bg-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-700/30 rounded-lg transition-colors text-stone-300 hover:text-stone-100"
                title="Следующий ход"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {showExitDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-xl border border-stone-700 p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-stone-100 mb-2">Выход из игры</h2>
              <p className="text-stone-400">
                Вы уверены, что хотите сдаться и выйти из игры? Это будет засчитано как поражение.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-medium transition-colors"
              >
                Продолжить игру
              </button>
              <button
                onClick={handleSurrender}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Сдаться
              </button>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-xl border border-stone-700 w-full max-w-2xl h-[80vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-700">
              <div className="flex items-center gap-3">
                <div className="text-3xl">♚</div>
                <div>
                  <h2 className="text-xl font-bold text-stone-100">
                    Компьютер ({getDifficultyLabel(difficulty)})
                  </h2>
                  <div className="text-sm text-stone-400">Соперник</div>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-stone-800 rounded-lg transition-colors text-stone-300 hover:text-stone-100"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Чат с соперником</p>
                  <p className="text-sm mt-2">Игра продолжается в фоновом режиме</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isOwn
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-stone-100 border border-stone-700'
                        }`}
                      >
                        <div className="text-sm break-words">{message.text}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.isOwn ? 'text-amber-100' : 'text-stone-500'
                          }`}
                        >
                          {message.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-stone-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Написать сообщение..."
                  className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Icon name="Send" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;