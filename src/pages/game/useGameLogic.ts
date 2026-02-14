import { useState, useEffect, useRef, useCallback } from 'react';
import { Board, Position, initialBoard, getInitialTime, getIncrement, CastlingRights, BoardTheme } from './gameTypes';
import { getPossibleMoves, getAllPossibleMovesForBoard, getBestMove, isCheckmate, isStalemate, getAllLegalMoves, isInCheck, findKing } from './gameLogic';
const FINISH_GAME_URL = 'https://functions.poehali.dev/24acb5e2-473c-4c15-a295-944e14d8aa96';
const GAME_HISTORY_URL = 'https://functions.poehali.dev/98112cc6-b0e2-4ab4-a9f0-050d3d0c3ba2';
const ONLINE_MOVE_URL = 'https://functions.poehali.dev/58a413af-81c4-47bd-b3ce-4552a349ae19';

export const useGameLogic = (
  difficulty: 'easy' | 'medium' | 'hard' | 'master',
  timeControl: string,
  playerColor: 'white' | 'black' = 'white',
  onlineGameId?: number
) => {
  const isOnlineGame = !!onlineGameId;
  const botColor = playerColor === 'white' ? 'black' : 'white';
  const loadGameState = () => {
    const saved = localStorage.getItem('activeGame');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const savedState = loadGameState();
  
  const [board, setBoard] = useState<Board>(savedState?.board || initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>(savedState?.currentPlayer || 'white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [whiteTime, setWhiteTime] = useState(savedState?.whiteTime || getInitialTime(timeControl));
  const [blackTime, setBlackTime] = useState(savedState?.blackTime || getInitialTime(timeControl));
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>(savedState?.gameStatus || 'playing');
  const [moveHistory, setMoveHistory] = useState<string[]>(savedState?.moveHistory || []);
  const [boardHistory, setBoardHistory] = useState<Board[]>(savedState?.boardHistory || [initialBoard]);
  const [moveTimes, setMoveTimes] = useState<string[]>(savedState?.moveTimes || []);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(savedState?.currentMoveIndex || 0);
  const [displayBoard, setDisplayBoard] = useState<Board>(savedState?.board || initialBoard);
  const [inactivityTimer, setInactivityTimer] = useState(60);
  const [capturedByWhite, setCapturedByWhite] = useState<{type: string; color: string}[]>(savedState?.capturedByWhite || []);
  const [capturedByBlack, setCapturedByBlack] = useState<{type: string; color: string}[]>(savedState?.capturedByBlack || []);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(savedState?.castlingRights || {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  });
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(savedState?.enPassantTarget || null);
  const [kingInCheckPosition, setKingInCheckPosition] = useState<Position | null>(null);
  const [showPossibleMoves, setShowPossibleMoves] = useState<boolean>(
    savedState?.showPossibleMoves !== undefined ? savedState.showPossibleMoves : true
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(
    savedState?.theme || (localStorage.getItem('chessTheme') as 'light' | 'dark') || 'dark'
  );
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(
    savedState?.boardTheme || (localStorage.getItem('chessBoardTheme') as BoardTheme) || 'wood'
  );
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(() => {
    const saved = localStorage.getItem('chessUser');
    return saved ? JSON.parse(saved).rating || null : null;
  });
  const historyRef = useRef<HTMLDivElement>(null);
  const hasPlayedWarning = useRef(false);
  const gameFinished = useRef(false);
  const gameStartTime = useRef(savedState?.gameStartTime || Date.now());

  useEffect(() => {
    const saved = localStorage.getItem('chessUser');
    if (!saved) return;
    const userData = JSON.parse(saved);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    fetch(`${GAME_HISTORY_URL}?user_id=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.user?.rating) {
          setUserRating(data.user.rating);
        }
      })
      .catch(() => {});
  }, []);

  const playWarningSound = () => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const updateInterval = currentPlayer === 'white' && whiteTime <= 10 
      ? 100 
      : currentPlayer === 'black' && blackTime <= 10 
      ? 100 
      : 1000;

    const timer = setInterval(() => {
      if (currentPlayer === 'white') {
        setWhiteTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            setGameStatus('checkmate');
            return 0;
          }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus, whiteTime, blackTime]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    setInactivityTimer(60);
    hasPlayedWarning.current = false;

    const inactivityInterval = setInterval(() => {
      setInactivityTimer(prev => {
        if (prev === 20 && !hasPlayedWarning.current && currentPlayer === playerColor) {
          playWarningSound();
          hasPlayedWarning.current = true;
        }
        
        if (prev <= 1) {
          setGameStatus('checkmate');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(inactivityInterval);
  }, [currentPlayer, gameStatus]);

  useEffect(() => {
    if (isOnlineGame) return;
    if (currentPlayer === botColor && gameStatus === 'playing') {
      setCurrentMoveIndex(boardHistory.length - 1);
      setDisplayBoard(board);
      setTimeout(() => makeComputerMove(), 500);
    }
  }, [currentPlayer, gameStatus]);

  useEffect(() => {
    setDisplayBoard(boardHistory[currentMoveIndex] || initialBoard);
  }, [currentMoveIndex]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      const gameState = {
        board,
        currentPlayer,
        whiteTime,
        blackTime,
        gameStatus,
        moveHistory,
        boardHistory,
        currentMoveIndex,
        gameStartTime: gameStartTime.current,
        difficulty,
        timeControl,
        capturedByWhite,
        capturedByBlack,
        castlingRights,
        enPassantTarget,
        showPossibleMoves,
        theme,
        boardTheme,
        moveTimes
      };
      localStorage.setItem('activeGame', JSON.stringify(gameState));
    } else {
      localStorage.removeItem('activeGame');
    }
  }, [board, currentPlayer, whiteTime, blackTime, gameStatus, moveHistory, boardHistory, currentMoveIndex, difficulty, timeControl, capturedByWhite, capturedByBlack, castlingRights, enPassantTarget, showPossibleMoves, theme, boardTheme, moveTimes]);

  const onlineMoveCountRef = useRef(0);
  
  const sendMoveToServer = useCallback(async (move: string, boardState: string, gameStatusVal: string, winnerId?: string) => {
    if (!isOnlineGame || !onlineGameId) return;
    const saved = localStorage.getItem('chessUser');
    if (!saved) return;
    const uData = JSON.parse(saved);
    const rawId = uData.email || uData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    
    fetch(ONLINE_MOVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'move',
        game_id: onlineGameId,
        user_id: userId,
        move,
        board_state: boardState,
        game_status: gameStatusVal,
        winner_id: winnerId || ''
      })
    }).catch(() => {});
  }, [isOnlineGame, onlineGameId]);

  const applyMoveFromNotation = useCallback((notation: string) => {
    const parts = notation.split('-');
    if (parts.length !== 2) return;
    const fromCol = parts[0].charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(parts[0][1]);
    const toCol = parts[1].charCodeAt(0) - 97;
    const toRow = 8 - parseInt(parts[1][1]);
    
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      const piece = newBoard[fromRow][fromCol];
      if (!piece) return prevBoard;

      const capturedPiece = newBoard[toRow][toCol];

      if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
        const isKingSide = toCol > fromCol;
        const rookFromCol = isKingSide ? 7 : 0;
        const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
        newBoard[fromRow][rookToCol] = newBoard[fromRow][rookFromCol];
        newBoard[fromRow][rookFromCol] = null;
      }

      if (piece.type === 'pawn' && toCol !== fromCol && !capturedPiece) {
        const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
        const enPassantCaptured = newBoard[capturedRow][toCol];
        if (enPassantCaptured) {
          if (piece.color === 'white') {
            setCapturedByWhite(prev => [...prev, {type: enPassantCaptured.type, color: enPassantCaptured.color}]);
          } else {
            setCapturedByBlack(prev => [...prev, {type: enPassantCaptured.type, color: enPassantCaptured.color}]);
          }
        }
        newBoard[capturedRow][toCol] = null;
      }

      if (capturedPiece) {
        if (piece.color === 'white') {
          setCapturedByWhite(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
        } else {
          setCapturedByBlack(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
        }
      }

      const promotionRow = piece.color === 'white' ? 0 : 7;
      if (piece.type === 'pawn' && toRow === promotionRow) {
        newBoard[toRow][toCol] = { type: 'queen', color: piece.color };
      } else {
        newBoard[toRow][toCol] = piece;
      }
      newBoard[fromRow][fromCol] = null;

      setCastlingRights(prev => {
        const nr = { ...prev };
        if (piece.type === 'king') {
          if (piece.color === 'white') { nr.whiteKingSide = false; nr.whiteQueenSide = false; }
          else { nr.blackKingSide = false; nr.blackQueenSide = false; }
        }
        if (piece.type === 'rook') {
          if (piece.color === 'white') {
            if (fromCol === 0) nr.whiteQueenSide = false;
            if (fromCol === 7) nr.whiteKingSide = false;
          } else {
            if (fromCol === 0) nr.blackQueenSide = false;
            if (fromCol === 7) nr.blackKingSide = false;
          }
        }
        return nr;
      });

      if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
        setEnPassantTarget({ row: piece.color === 'white' ? fromRow - 1 : fromRow + 1, col: fromCol });
      } else {
        setEnPassantTarget(null);
      }

      setMoveHistory(prev => [...prev, notation]);
      setBoardHistory(prev => [...prev, newBoard]);
      setCurrentMoveIndex(prev => prev + 1);
      setDisplayBoard(newBoard);

      const nextPlayer: 'white' | 'black' = piece.color === 'white' ? 'black' : 'white';
      setCurrentPlayer(nextPlayer);

      setTimeout(() => {
        if (isInCheck(newBoard, nextPlayer)) {
          const kingPos = findKing(newBoard, nextPlayer);
          setKingInCheckPosition(kingPos);
        } else {
          setKingInCheckPosition(null);
        }
      }, 100);

      return newBoard;
    });
  }, []);

  useEffect(() => {
    if (!isOnlineGame || !onlineGameId) return;
    if (gameStatus !== 'playing') return;
    if (currentPlayer === playerColor) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${ONLINE_MOVE_URL}?game_id=${onlineGameId}`);
        const data = await res.json();
        if (!data.game) return;

        const serverMoves = data.game.move_history ? data.game.move_history.split(',').filter(Boolean) : [];
        
        if (data.game.status === 'finished') {
          setGameStatus('checkmate');
          clearInterval(pollInterval);
          return;
        }

        if (serverMoves.length > onlineMoveCountRef.current) {
          const newMoves = serverMoves.slice(onlineMoveCountRef.current);
          for (const m of newMoves) {
            applyMoveFromNotation(m);
          }
          onlineMoveCountRef.current = serverMoves.length;
        }

        if (data.game.white_time !== undefined) setWhiteTime(data.game.white_time);
        if (data.game.black_time !== undefined) setBlackTime(data.game.black_time);
      } catch (e) { console.error(e); }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [isOnlineGame, onlineGameId, gameStatus, currentPlayer, playerColor, applyMoveFromNotation]);

  useEffect(() => {
    if (!isOnlineGame) return;
    onlineMoveCountRef.current = moveHistory.length;
  }, [moveHistory.length, isOnlineGame]);

  const submitGameResult = useCallback(async (status: 'checkmate' | 'stalemate' | 'draw', currentPlayerAtEnd: string) => {
    if (gameFinished.current) return;
    gameFinished.current = true;

    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return;

    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);

    let result: 'win' | 'loss' | 'draw';
    if (status === 'draw' || status === 'stalemate') {
      result = 'draw';
    } else {
      result = currentPlayerAtEnd === playerColor ? 'loss' : 'win';
    }

    const durationSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000);

    try {
      const res = await fetch(FINISH_GAME_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username: userData.name || 'Player',
          avatar: userData.avatar || '',
          result,
          opponent_name: 'bot',
          opponent_type: 'bot',
          user_color: playerColor,
          time_control: timeControl,
          difficulty,
          moves_count: moveHistory.length,
          move_history: moveHistory.join(','),
          move_times: moveTimes.join(','),
          duration_seconds: durationSeconds,
          end_reason: status
        })
      });
      const data = await res.json();
      if (data.rating_change !== undefined) {
        setRatingChange(data.rating_change);
        setNewRating(data.rating_after);
        const updatedUser = { ...userData, rating: data.rating_after };
        localStorage.setItem('chessUser', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Failed to submit game result:', e);
    }
  }, [playerColor, timeControl, difficulty, moveHistory, moveTimes]);

  useEffect(() => {
    if (gameStatus !== 'playing' && !gameFinished.current && moveHistory.length > 2) {
      submitGameResult(gameStatus as 'checkmate' | 'stalemate' | 'draw', currentPlayer);
    }
  }, [gameStatus]);

  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return;

    const capturedPiece = newBoard[to.row][to.col];
    const newCastlingRights = { ...castlingRights };
    let newEnPassantTarget: Position | null = null;

    // Рокировка
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingSide = to.col > from.col;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? to.col - 1 : to.col + 1;
      
      newBoard[from.row][rookToCol] = newBoard[from.row][rookFromCol];
      newBoard[from.row][rookFromCol] = null;
    }

    // Взятие на проходе
    if (piece.type === 'pawn' && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
      const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      const enPassantCaptured = newBoard[capturedRow][to.col];
      if (enPassantCaptured) {
        if (piece.color === 'white') {
          setCapturedByWhite(prev => [...prev, {type: enPassantCaptured.type, color: enPassantCaptured.color}]);
        } else {
          setCapturedByBlack(prev => [...prev, {type: enPassantCaptured.type, color: enPassantCaptured.color}]);
        }
      }
      newBoard[capturedRow][to.col] = null;
    }

    // Обычное взятие
    if (capturedPiece) {
      if (piece.color === 'white') {
        setCapturedByWhite(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
      } else {
        setCapturedByBlack(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
      }
    }

    // Превращение пешки
    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (piece.type === 'pawn' && to.row === promotionRow) {
      newBoard[to.row][to.col] = { type: 'queen', color: piece.color };
    } else {
      newBoard[to.row][to.col] = piece;
    }
    newBoard[from.row][from.col] = null;

    // Обновление прав на рокировку
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        newCastlingRights.whiteKingSide = false;
        newCastlingRights.whiteQueenSide = false;
      } else {
        newCastlingRights.blackKingSide = false;
        newCastlingRights.blackQueenSide = false;
      }
    }
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (from.col === 0) newCastlingRights.whiteQueenSide = false;
        if (from.col === 7) newCastlingRights.whiteKingSide = false;
      } else {
        if (from.col === 0) newCastlingRights.blackQueenSide = false;
        if (from.col === 7) newCastlingRights.blackKingSide = false;
      }
    }

    // Установка цели взятия на проходе
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      newEnPassantTarget = {
        row: piece.color === 'white' ? from.row - 1 : from.row + 1,
        col: from.col
      };
    }

    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);

    const moveNotation = `${String.fromCharCode(97 + from.col)}${8 - from.row}-${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const newMoveHistory = [...moveHistory, moveNotation];
    const newBoardHistory = [...boardHistory, newBoard];
    const timeAfterMove = currentPlayer === 'white' ? Math.round(whiteTime) : Math.round(blackTime);
    const newMoveTimes = [...moveTimes, String(timeAfterMove)];
    
    setMoveHistory(newMoveHistory);
    setBoardHistory(newBoardHistory);
    setMoveTimes(newMoveTimes);
    
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
    
    const increment = getIncrement(timeControl);
    if (currentPlayer === 'white' && increment > 0) {
      setWhiteTime(prev => prev + increment);
    } else if (currentPlayer === 'black' && increment > 0) {
      setBlackTime(prev => prev + increment);
    }
    
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    setCurrentPlayer(nextPlayer);
    
    let finalGameStatus = 'playing';
    let winnerId = '';

    setTimeout(() => {
      if (isInCheck(newBoard, nextPlayer)) {
        const kingPos = findKing(newBoard, nextPlayer);
        setKingInCheckPosition(kingPos);
      } else {
        setKingInCheckPosition(null);
      }
      
      if (isCheckmate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
        setGameStatus('checkmate');
        finalGameStatus = 'checkmate';
        const saved = localStorage.getItem('chessUser');
        if (saved) {
          const uData = JSON.parse(saved);
          const rawId = uData.email || uData.name || 'anonymous';
          winnerId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        }
      } else if (isStalemate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
        setGameStatus('stalemate');
        finalGameStatus = 'stalemate';
      }

      if (isOnlineGame && piece?.color === playerColor) {
        sendMoveToServer(moveNotation, JSON.stringify(newBoard), finalGameStatus, winnerId);
      }
    }, 100);
  };

  const makeComputerMove = () => {
    const moves = getAllLegalMoves(board, botColor, castlingRights, enPassantTarget);
    if (moves.length === 0) {
      if (isCheckmate(board, botColor, castlingRights, enPassantTarget)) {
        setGameStatus('checkmate');
      } else {
        setGameStatus('stalemate');
      }
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
    if (currentPlayer !== playerColor || gameStatus !== 'playing') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const isValidTarget = possibleMoves.some(m => m.row === row && m.col === col);
      
      if (isValidTarget) {
        makeMove(selectedSquare, { row, col });
      } else if (piece && piece.color === playerColor) {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(board, { row, col }, castlingRights, enPassantTarget));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === playerColor) {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(board, { row, col }, castlingRights, enPassantTarget));
    }
  };

  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isSquarePossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(m => m.row === row && m.col === col);
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

  return {
    board,
    displayBoard,
    selectedSquare,
    currentPlayer,
    possibleMoves,
    whiteTime,
    blackTime,
    gameStatus,
    setGameStatus,
    moveHistory,
    boardHistory,
    currentMoveIndex,
    inactivityTimer,
    capturedByWhite,
    capturedByBlack,
    kingInCheckPosition,
    showPossibleMoves,
    setShowPossibleMoves,
    theme,
    setTheme,
    boardTheme,
    setBoardTheme,
    ratingChange,
    newRating,
    userRating,
    historyRef,
    handleSquareClick,
    isSquareSelected,
    isSquarePossibleMove,
    handlePreviousMove,
    handleNextMove
  };
};