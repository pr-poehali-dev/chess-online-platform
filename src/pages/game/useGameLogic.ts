import { useState, useEffect, useRef, useCallback } from 'react';
import { Board, Position, initialBoard, getInitialTime, getIncrement, CastlingRights, BoardTheme } from './gameTypes';
import { getPossibleMoves, getBestMove, isCheckmate, isStalemate, getAllLegalMoves, isInCheck, findKing } from './gameLogic';
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
    if (isOnlineGame) return null;
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
  const [currentMoveIndex, setCurrentMoveIndex] = useState(savedState?.boardHistory ? savedState.boardHistory.length - 1 : 0);
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

  const boardRef = useRef<Board>(savedState?.board || initialBoard);
  const currentPlayerRef = useRef<'white' | 'black'>(savedState?.currentPlayer || 'white');
  const castlingRightsRef = useRef<CastlingRights>(savedState?.castlingRights || {
    whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true
  });
  const enPassantTargetRef = useRef<Position | null>(savedState?.enPassantTarget || null);
  const moveHistoryRef = useRef<string[]>(savedState?.moveHistory || []);
  const boardHistoryRef = useRef<Board[]>(savedState?.boardHistory || [initialBoard]);
  const gameStatusRef = useRef<string>(savedState?.gameStatus || 'playing');
  const onlineMoveCountRef = useRef(0);
  const isApplyingMoveRef = useRef(false);
  const onlineReadyRef = useRef(!isOnlineGame);

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
          if (prev <= 0) { setGameStatus('checkmate'); gameStatusRef.current = 'checkmate'; return 0; }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) { setGameStatus('checkmate'); gameStatusRef.current = 'checkmate'; return 0; }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      }
    }, updateInterval);
    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus, whiteTime, blackTime]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (isOnlineGame && currentPlayerRef.current !== playerColor) return;
    setInactivityTimer(60);
    hasPlayedWarning.current = false;
    const inactivityInterval = setInterval(() => {
      if (isOnlineGame && currentPlayerRef.current !== playerColor) return;
      setInactivityTimer(prev => {
        if (prev === 20 && !hasPlayedWarning.current && currentPlayerRef.current === playerColor) {
          playWarningSound();
          hasPlayedWarning.current = true;
        }
        if (prev <= 1) {
          setGameStatus('checkmate');
          gameStatusRef.current = 'checkmate';
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
      const idx = boardHistoryRef.current.length - 1;
      setCurrentMoveIndex(idx);
      setDisplayBoard(boardHistoryRef.current[idx] || boardRef.current);
      setTimeout(() => makeComputerMove(), 500);
    }
  }, [currentPlayer, gameStatus]);

  // displayBoard is set explicitly in makeMove, applyMoveFromNotation, and nav handlers

  useEffect(() => {
    if (isOnlineGame) return;
    if (gameStatus === 'playing') {
      const gameState = {
        board, currentPlayer, whiteTime, blackTime, gameStatus,
        moveHistory, boardHistory, currentMoveIndex,
        gameStartTime: gameStartTime.current,
        difficulty, timeControl, capturedByWhite, capturedByBlack,
        castlingRights, enPassantTarget, showPossibleMoves,
        theme, boardTheme, moveTimes
      };
      localStorage.setItem('activeGame', JSON.stringify(gameState));
    } else {
      localStorage.removeItem('activeGame');
    }
  }, [board, currentPlayer, whiteTime, blackTime, gameStatus, moveHistory, boardHistory, currentMoveIndex, difficulty, timeControl, capturedByWhite, capturedByBlack, castlingRights, enPassantTarget, showPossibleMoves, theme, boardTheme, moveTimes, isOnlineGame]);

  const sendMoveToServer = useCallback(async (move: string, boardState: string, gameStatusVal: string, winnerId?: string) => {
    if (!isOnlineGame || !onlineGameId) return;
    const saved = localStorage.getItem('chessUser');
    if (!saved) return;
    const uData = JSON.parse(saved);
    const rawId = uData.email || uData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    try {
      const res = await fetch(ONLINE_MOVE_URL, {
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
      });
      if (!res.ok) {
        console.error('Move rejected by server, status:', res.status);
      }
    } catch(e) { console.error('sendMove error', e); }
  }, [isOnlineGame, onlineGameId]);

  const applyMoveFromNotation = useCallback((notation: string) => {
    if (isApplyingMoveRef.current) return;
    isApplyingMoveRef.current = true;

    const parts = notation.split('-');
    if (parts.length !== 2) { isApplyingMoveRef.current = false; return; }
    const fromCol = parts[0].charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(parts[0][1]);
    const toCol = parts[1].charCodeAt(0) - 97;
    const toRow = 8 - parseInt(parts[1][1]);

    const curBoard = boardRef.current;
    const newBoard = curBoard.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    if (!piece) { isApplyingMoveRef.current = false; return; }

    const capturedPiece = newBoard[toRow][toCol];
    const curCR = { ...castlingRightsRef.current };

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

    if (piece.type === 'king') {
      if (piece.color === 'white') { curCR.whiteKingSide = false; curCR.whiteQueenSide = false; }
      else { curCR.blackKingSide = false; curCR.blackQueenSide = false; }
    }
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (fromCol === 0) curCR.whiteQueenSide = false;
        if (fromCol === 7) curCR.whiteKingSide = false;
      } else {
        if (fromCol === 0) curCR.blackQueenSide = false;
        if (fromCol === 7) curCR.blackKingSide = false;
      }
    }

    let newEP: Position | null = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      newEP = { row: piece.color === 'white' ? fromRow - 1 : fromRow + 1, col: fromCol };
    }

    const nextPlayer: 'white' | 'black' = piece.color === 'white' ? 'black' : 'white';
    const newMH = [...moveHistoryRef.current, notation];
    const newBH = [...boardHistoryRef.current, newBoard];

    boardRef.current = newBoard;
    currentPlayerRef.current = nextPlayer;
    castlingRightsRef.current = curCR;
    enPassantTargetRef.current = newEP;
    moveHistoryRef.current = newMH;
    boardHistoryRef.current = newBH;

    setBoard(newBoard);
    setDisplayBoard(newBoard);
    setCastlingRights(curCR);
    setEnPassantTarget(newEP);
    setMoveHistory(newMH);
    setBoardHistory(newBH);
    setCurrentMoveIndex(newBH.length - 1);
    setCurrentPlayer(nextPlayer);
    setSelectedSquare(null);
    setPossibleMoves([]);

    if (isInCheck(newBoard, nextPlayer)) {
      const kingPos = findKing(newBoard, nextPlayer);
      setKingInCheckPosition(kingPos);
    } else {
      setKingInCheckPosition(null);
    }

    if (isCheckmate(newBoard, nextPlayer, curCR, newEP)) {
      setGameStatus('checkmate');
      gameStatusRef.current = 'checkmate';
    } else if (isStalemate(newBoard, nextPlayer, curCR, newEP)) {
      setGameStatus('stalemate');
      gameStatusRef.current = 'stalemate';
    }

    isApplyingMoveRef.current = false;
  }, []);

  useEffect(() => {
    if (!isOnlineGame || !onlineGameId) return;

    let active = true;

    const syncFromServer = async () => {
      try {
        const res = await fetch(`${ONLINE_MOVE_URL}?game_id=${onlineGameId}`);
        const data = await res.json();
        if (!active || !data.game) return;

        if (data.game.status === 'finished') {
          setGameStatus('checkmate');
          gameStatusRef.current = 'checkmate';
          return;
        }

        const serverMoves: string[] = data.game.move_history ? data.game.move_history.split(',').filter(Boolean) : [];
        const localCount = onlineMoveCountRef.current;

        if (serverMoves.length > localCount) {
          const newMoves = serverMoves.slice(localCount);
          for (const m of newMoves) {
            applyMoveFromNotation(m);
          }
          onlineMoveCountRef.current = serverMoves.length;
        }

        if (data.game.white_time !== undefined) setWhiteTime(data.game.white_time);
        if (data.game.black_time !== undefined) setBlackTime(data.game.black_time);
      } catch (e) { console.error('poll error', e); }
    };

    const startPolling = async () => {
      await syncFromServer();
      onlineReadyRef.current = true;

      while (active) {
        await sleep(600);
        if (!active) break;
        if (gameStatusRef.current !== 'playing') break;
        if (currentPlayerRef.current !== playerColor) {
          await syncFromServer();
        }
      }
    };

    startPolling();

    return () => { active = false; };
  }, [isOnlineGame, onlineGameId, playerColor, applyMoveFromNotation]);

  const [rematchOfferedBy, setRematchOfferedBy] = useState<string | null>(null);
  const [rematchStatus, setRematchStatus] = useState<string | null>(null);
  const [rematchGameId, setRematchGameId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOnlineGame || !onlineGameId) return;
    if (gameStatus === 'playing') return;
    const rematchPoll = setInterval(async () => {
      try {
        const res = await fetch(`${ONLINE_MOVE_URL}?game_id=${onlineGameId}`);
        const data = await res.json();
        if (!data.game) return;
        if (data.game.rematch_offered_by) setRematchOfferedBy(data.game.rematch_offered_by);
        if (data.game.rematch_status) setRematchStatus(data.game.rematch_status);
        if (data.game.rematch_game_id) {
          setRematchGameId(data.game.rematch_game_id);
          clearInterval(rematchPoll);
        }
        if (data.game.rematch_status === 'declined') {
          clearInterval(rematchPoll);
        }
      } catch (e) { console.error(e); }
    }, 1000);
    return () => clearInterval(rematchPoll);
  }, [isOnlineGame, onlineGameId, gameStatus]);

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
          moves_count: moveHistoryRef.current.length,
          move_history: moveHistoryRef.current.join(','),
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
  }, [playerColor, timeControl, difficulty, moveTimes]);

  useEffect(() => {
    if (gameStatus !== 'playing' && !gameFinished.current && moveHistoryRef.current.length > 2) {
      submitGameResult(gameStatus as 'checkmate' | 'stalemate' | 'draw', currentPlayerRef.current);
    }
  }, [gameStatus]);

  const makeMove = (from: Position, to: Position) => {
    const curBoard = boardRef.current;
    const newBoard = curBoard.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    if (!piece) return;

    const capturedPiece = newBoard[to.row][to.col];
    const newCastlingRights = { ...castlingRightsRef.current };
    let newEnPassantTarget: Position | null = null;

    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingSide = to.col > from.col;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? to.col - 1 : to.col + 1;
      newBoard[from.row][rookToCol] = newBoard[from.row][rookFromCol];
      newBoard[from.row][rookFromCol] = null;
    }

    if (piece.type === 'pawn' && enPassantTargetRef.current && to.row === enPassantTargetRef.current.row && to.col === enPassantTargetRef.current.col) {
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

    if (capturedPiece) {
      if (piece.color === 'white') {
        setCapturedByWhite(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
      } else {
        setCapturedByBlack(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
      }
    }

    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (piece.type === 'pawn' && to.row === promotionRow) {
      newBoard[to.row][to.col] = { type: 'queen', color: piece.color };
    } else {
      newBoard[to.row][to.col] = piece;
    }
    newBoard[from.row][from.col] = null;

    if (piece.type === 'king') {
      if (piece.color === 'white') { newCastlingRights.whiteKingSide = false; newCastlingRights.whiteQueenSide = false; }
      else { newCastlingRights.blackKingSide = false; newCastlingRights.blackQueenSide = false; }
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

    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      newEnPassantTarget = { row: piece.color === 'white' ? from.row - 1 : from.row + 1, col: from.col };
    }

    const moveNotation = `${String.fromCharCode(97 + from.col)}${8 - from.row}-${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const nextPlayer: 'white' | 'black' = currentPlayerRef.current === 'white' ? 'black' : 'white';
    const newMH = [...moveHistoryRef.current, moveNotation];
    const newBH = [...boardHistoryRef.current, newBoard];
    const timeAfterMove = currentPlayerRef.current === 'white' ? Math.round(whiteTime) : Math.round(blackTime);
    const newMoveTimes = [...moveTimes, String(timeAfterMove)];

    boardRef.current = newBoard;
    currentPlayerRef.current = nextPlayer;
    castlingRightsRef.current = newCastlingRights;
    enPassantTargetRef.current = newEnPassantTarget;
    moveHistoryRef.current = newMH;
    boardHistoryRef.current = newBH;

    setBoard(newBoard);
    setDisplayBoard(newBoard);
    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);
    setMoveHistory(newMH);
    setBoardHistory(newBH);
    setMoveTimes(newMoveTimes);
    setCurrentMoveIndex(newBH.length - 1);
    setCurrentPlayer(nextPlayer);
    setSelectedSquare(null);
    setPossibleMoves([]);

    const increment = getIncrement(timeControl);
    if (currentPlayerRef.current === 'black' && increment > 0) {
      setWhiteTime(prev => prev + increment);
    } else if (currentPlayerRef.current === 'white' && increment > 0) {
      setBlackTime(prev => prev + increment);
    }

    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollLeft = historyRef.current.scrollWidth;
      }
    }, 10);

    if (isInCheck(newBoard, nextPlayer)) {
      const kingPos = findKing(newBoard, nextPlayer);
      setKingInCheckPosition(kingPos);
    } else {
      setKingInCheckPosition(null);
    }

    let finalGameStatus = 'playing';
    let winnerId = '';

    if (isCheckmate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
      setGameStatus('checkmate');
      gameStatusRef.current = 'checkmate';
      finalGameStatus = 'checkmate';
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const uData = JSON.parse(saved);
        const rawId = uData.email || uData.name || 'anonymous';
        winnerId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
      }
    } else if (isStalemate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
      setGameStatus('stalemate');
      gameStatusRef.current = 'stalemate';
      finalGameStatus = 'stalemate';
    }

    if (isOnlineGame && piece?.color === playerColor) {
      onlineMoveCountRef.current = newMH.length;
      sendMoveToServer(moveNotation, JSON.stringify(newBoard), finalGameStatus, winnerId);
    }
  };

  const makeComputerMove = () => {
    const curBoard = boardRef.current;
    const curCR = castlingRightsRef.current;
    const curEP = enPassantTargetRef.current;
    const moves = getAllLegalMoves(curBoard, botColor, curCR, curEP);
    if (moves.length === 0) {
      if (isCheckmate(curBoard, botColor, curCR, curEP)) {
        setGameStatus('checkmate');
        gameStatusRef.current = 'checkmate';
      } else {
        setGameStatus('stalemate');
        gameStatusRef.current = 'stalemate';
      }
      return;
    }
    let selectedMove;
    switch (difficulty) {
      case 'easy': selectedMove = moves[Math.floor(Math.random() * moves.length)]; break;
      case 'medium': selectedMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))]; break;
      case 'hard': selectedMove = getBestMove(curBoard, moves, false); break;
      case 'master': selectedMove = getBestMove(curBoard, moves, true); break;
      default: selectedMove = moves[0];
    }
    makeMove(selectedMove.from, selectedMove.to);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!onlineReadyRef.current) return;
    if (currentPlayerRef.current !== playerColor) return;
    if (gameStatusRef.current !== 'playing') return;

    const curBoard = boardRef.current;
    const piece = curBoard[row][col];

    if (selectedSquare) {
      const isValidTarget = possibleMoves.some(m => m.row === row && m.col === col);
      if (isValidTarget) {
        makeMove(selectedSquare, { row, col });
      } else if (piece && piece.color === playerColor) {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(curBoard, { row, col }, castlingRightsRef.current, enPassantTargetRef.current));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === playerColor) {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(curBoard, { row, col }, castlingRightsRef.current, enPassantTargetRef.current));
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
      const newIdx = currentMoveIndex - 1;
      setCurrentMoveIndex(newIdx);
      setDisplayBoard(boardHistoryRef.current[newIdx] || initialBoard);
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < boardHistoryRef.current.length - 1) {
      const newIdx = currentMoveIndex + 1;
      setCurrentMoveIndex(newIdx);
      setDisplayBoard(boardHistoryRef.current[newIdx] || boardRef.current);
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
    rematchOfferedBy,
    rematchStatus,
    rematchGameId,
    handleSquareClick,
    isSquareSelected,
    isSquarePossibleMove,
    handlePreviousMove,
    handleNextMove
  };
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}