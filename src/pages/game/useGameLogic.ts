import { useState, useEffect, useRef } from 'react';
import { Board, Position, initialBoard, getInitialTime, CastlingRights } from './gameTypes';
import { getPossibleMoves, getAllPossibleMovesForBoard, getBestMove, isCheckmate, isStalemate, getAllLegalMoves, isInCheck, findKing } from './gameLogic';

export const useGameLogic = (
  difficulty: 'easy' | 'medium' | 'hard' | 'master',
  timeControl: 'blitz' | 'rapid' | 'classic'
) => {
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
  const historyRef = useRef<HTMLDivElement>(null);
  const hasPlayedWarning = useRef(false);
  const gameStartTime = useRef(savedState?.gameStartTime || Date.now());

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
        if (prev === 20 && !hasPlayedWarning.current && currentPlayer === 'white') {
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
    if (currentPlayer === 'black' && gameStatus === 'playing') {
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
        showPossibleMoves
      };
      localStorage.setItem('activeGame', JSON.stringify(gameState));
    } else {
      localStorage.removeItem('activeGame');
    }
  }, [board, currentPlayer, whiteTime, blackTime, gameStatus, moveHistory, boardHistory, currentMoveIndex, difficulty, timeControl, capturedByWhite, capturedByBlack, castlingRights, enPassantTarget]);

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
    
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    setCurrentPlayer(nextPlayer);
    
    // Проверка шаха
    setTimeout(() => {
      if (isInCheck(newBoard, nextPlayer)) {
        const kingPos = findKing(newBoard, nextPlayer);
        setKingInCheckPosition(kingPos);
      } else {
        setKingInCheckPosition(null);
      }
      
      // Проверка мата или пата
      if (isCheckmate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
        setGameStatus('checkmate');
      } else if (isStalemate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
        setGameStatus('stalemate');
      }
    }, 100);
  };

  const makeComputerMove = () => {
    const moves = getAllLegalMoves(board, 'black', castlingRights, enPassantTarget);
    if (moves.length === 0) {
      if (isCheckmate(board, 'black', castlingRights, enPassantTarget)) {
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
    if (currentPlayer !== 'white' || gameStatus !== 'playing') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const isValidTarget = possibleMoves.some(m => m.row === row && m.col === col);
      
      if (isValidTarget) {
        makeMove(selectedSquare, { row, col });
      } else if (piece && piece.color === 'white') {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(board, { row, col }, castlingRights, enPassantTarget));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === 'white') {
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
    historyRef,
    handleSquareClick,
    isSquareSelected,
    isSquarePossibleMove,
    handlePreviousMove,
    handleNextMove
  };
};