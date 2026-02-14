import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Board, Position, initialBoard, getInitialTime, getIncrement, CastlingRights, BoardTheme } from './gameTypes';
import { getPossibleMoves, getBestMove, isCheckmate, isStalemate, getAllLegalMoves, isInCheck, findKing } from './gameLogic';
import API from '@/config/api';
const FINISH_GAME_URL = API.finishGame;
const GAME_HISTORY_URL = API.gameHistory;
const ONLINE_MOVE_URL = API.onlineMove;

function replayMoves(moves: string[]): {
  board: Board;
  boardHistory: Board[];
  currentPlayer: 'white' | 'black';
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: {type: string; color: string}[];
  capturedByBlack: {type: string; color: string}[];
  kingInCheck: Position | null;
  status: 'playing' | 'checkmate' | 'stalemate';
} {
  let curBoard: Board = initialBoard.map(row => row.map(cell => cell ? { ...cell } : null));
  const boardHistory: Board[] = [curBoard.map(row => row.map(cell => cell ? { ...cell } : null))];
  const cr: CastlingRights = { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true };
  let ep: Position | null = null;
  let player: 'white' | 'black' = 'white';
  const captW: {type: string; color: string}[] = [];
  const captB: {type: string; color: string}[] = [];

  for (const notation of moves) {
    const parts = notation.split('-');
    if (parts.length !== 2) continue;
    const fromCol = parts[0].charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(parts[0][1]);
    const toCol = parts[1].charCodeAt(0) - 97;
    const toRow = 8 - parseInt(parts[1][1]);

    const newBoard = curBoard.map(row => row.map(cell => cell ? { ...cell } : null));
    const piece = newBoard[fromRow][fromCol];
    if (!piece) continue;

    const captured = newBoard[toRow][toCol];

    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
      const isKingSide = toCol > fromCol;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
      newBoard[fromRow][rookToCol] = newBoard[fromRow][rookFromCol];
      newBoard[fromRow][rookFromCol] = null;
    }

    if (piece.type === 'pawn' && toCol !== fromCol && !captured) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      const epCaptured = newBoard[capturedRow][toCol];
      if (epCaptured) {
        if (piece.color === 'white') captW.push({type: epCaptured.type, color: epCaptured.color});
        else captB.push({type: epCaptured.type, color: epCaptured.color});
      }
      newBoard[capturedRow][toCol] = null;
    }

    if (captured) {
      if (piece.color === 'white') captW.push({type: captured.type, color: captured.color});
      else captB.push({type: captured.type, color: captured.color});
    }

    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (piece.type === 'pawn' && toRow === promotionRow) {
      newBoard[toRow][toCol] = { type: 'queen', color: piece.color };
    } else {
      newBoard[toRow][toCol] = piece;
    }
    newBoard[fromRow][fromCol] = null;

    if (piece.type === 'king') {
      if (piece.color === 'white') { cr.whiteKingSide = false; cr.whiteQueenSide = false; }
      else { cr.blackKingSide = false; cr.blackQueenSide = false; }
    }
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (fromCol === 0) cr.whiteQueenSide = false;
        if (fromCol === 7) cr.whiteKingSide = false;
      } else {
        if (fromCol === 0) cr.blackQueenSide = false;
        if (fromCol === 7) cr.blackKingSide = false;
      }
    }

    ep = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      ep = { row: piece.color === 'white' ? fromRow - 1 : fromRow + 1, col: fromCol };
    }

    player = piece.color === 'white' ? 'black' : 'white';
    curBoard = newBoard;
    boardHistory.push(newBoard.map(row => row.map(cell => cell ? { ...cell } : null)));
  }

  let kingInCheck: Position | null = null;
  if (isInCheck(curBoard, player)) {
    kingInCheck = findKing(curBoard, player);
  }

  let status: 'playing' | 'checkmate' | 'stalemate' = 'playing';
  if (moves.length > 0) {
    if (isCheckmate(curBoard, player, cr, ep)) status = 'checkmate';
    else if (isStalemate(curBoard, player, cr, ep)) status = 'stalemate';
  }

  return {
    board: curBoard,
    boardHistory,
    currentPlayer: player,
    castlingRights: cr,
    enPassantTarget: ep,
    capturedByWhite: captW,
    capturedByBlack: captB,
    kingInCheck,
    status
  };
}

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
  const [currentMoveIndex, setCurrentMoveIndex] = useState(savedState?.currentMoveIndex || 0);
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
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
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
  const [onlineReady, setOnlineReady] = useState(!isOnlineGame);
  const onlineReadyRef = useRef(!isOnlineGame);

  const historyRef = useRef<HTMLDivElement>(null);
  const hasPlayedWarning = useRef(false);
  const gameFinished = useRef(false);
  const gameStartTime = useRef(savedState?.gameStartTime || Date.now());
  const serverMoveCountRef = useRef(0);
  const serverMoveNumberRef = useRef(0);
  const pendingMoveRef = useRef<string | null>(null);

  const displayBoard = useMemo(() => {
    return boardHistory[currentMoveIndex] || initialBoard;
  }, [boardHistory, currentMoveIndex]);

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

  const playMoveSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* audio not available */ }
  }, []);

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
          if (prev <= 0) { setGameStatus('checkmate'); return 0; }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) { setGameStatus('checkmate'); return 0; }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      }
    }, updateInterval);
    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus, whiteTime, blackTime]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (isOnlineGame && currentPlayer !== playerColor) return;
    setInactivityTimer(60);
    hasPlayedWarning.current = false;
    const inactivityInterval = setInterval(() => {
      if (isOnlineGame && currentPlayer !== playerColor) return;
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
  }, [currentPlayer, gameStatus, isOnlineGame, playerColor]);

  useEffect(() => {
    if (isOnlineGame) return;
    if (currentPlayer === botColor && gameStatus === 'playing') {
      setCurrentMoveIndex(boardHistory.length - 1);
      setTimeout(() => makeComputerMove(), 4000);
    }
  }, [currentPlayer, gameStatus]);

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

  const sendMoveToServer = useCallback(async (move: string, gameStatusVal: string, winnerId?: string) => {
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
          board_state: '',
          game_status: gameStatusVal,
          winner_id: winnerId || '',
          move_number: serverMoveNumberRef.current
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.move_number !== undefined) {
          serverMoveNumberRef.current = data.move_number;
        }
      } else if (res.status === 409) {
        console.warn('Move conflict, will re-sync from server');
        pendingMoveRef.current = null;
      } else {
        console.error('Move rejected:', res.status);
      }
    } catch(e) { console.error('sendMove error', e); }
  }, [isOnlineGame, onlineGameId]);

  const applyServerState = useCallback((serverMoves: string[], wTime: number, bTime: number, serverStatus: string, moveNumber?: number) => {
    if (pendingMoveRef.current && serverMoves.length < serverMoveCountRef.current) return;
    if (serverMoves.length === serverMoveCountRef.current && serverStatus !== 'finished') return;
    const prevCount = serverMoveCountRef.current;
    serverMoveCountRef.current = serverMoves.length;

    if (moveNumber !== undefined) {
      serverMoveNumberRef.current = moveNumber;
    }

    const opponentMoved = serverMoves.length > prevCount && prevCount > 0;

    const result = replayMoves(serverMoves);

    if (opponentMoved && serverMoves.length > 0) {
      const lastNotation = serverMoves[serverMoves.length - 1];
      const parts = lastNotation.split('-');
      if (parts.length === 2) {
        const fromCol = parts[0].charCodeAt(0) - 97;
        const fromRow = 8 - parseInt(parts[0][1]);
        const toCol = parts[1].charCodeAt(0) - 97;
        const toRow = 8 - parseInt(parts[1][1]);
        setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } });
      }
    }

    setBoard(result.board);
    setBoardHistory(result.boardHistory);
    setMoveHistory(serverMoves);
    setCurrentMoveIndex(result.boardHistory.length - 1);
    setCurrentPlayer(result.currentPlayer);
    setCastlingRights(result.castlingRights);
    setEnPassantTarget(result.enPassantTarget);
    setCapturedByWhite(result.capturedByWhite);
    setCapturedByBlack(result.capturedByBlack);
    setKingInCheckPosition(result.kingInCheck);
    setSelectedSquare(null);
    setPossibleMoves([]);

    if (serverStatus === 'finished' || result.status !== 'playing') {
      if (result.status === 'checkmate') setGameStatus('checkmate');
      else if (result.status === 'stalemate') setGameStatus('stalemate');
      else if (serverStatus === 'finished') setGameStatus('checkmate');
    }

    setWhiteTime(wTime);
    setBlackTime(bTime);

    pendingMoveRef.current = null;

    if (opponentMoved && result.currentPlayer === playerColor) {
      playMoveSound();
    }

    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollLeft = historyRef.current.scrollWidth;
      }
    }, 10);
  }, [playerColor, playMoveSound]);

  useEffect(() => {
    if (!isOnlineGame || !onlineGameId) return;
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(`${ONLINE_MOVE_URL}?game_id=${onlineGameId}`);
        const data = await res.json();
        if (!active || !data.game) return;

        const serverMoves: string[] = data.game.move_history
          ? data.game.move_history.split(',').filter(Boolean)
          : [];

        applyServerState(
          serverMoves,
          data.game.white_time ?? getInitialTime(timeControl),
          data.game.black_time ?? getInitialTime(timeControl),
          data.game.status,
          data.game.move_number
        );

        if (!onlineReadyRef.current) {
          onlineReadyRef.current = true;
          setOnlineReady(true);
        }
      } catch (e) { console.error('poll error', e); }
    };

    poll();

    const intervalId = setInterval(() => {
      if (!active) return;
      poll();
    }, 500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [isOnlineGame, onlineGameId, timeControl, applyServerState]);

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

    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingSide = to.col > from.col;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? to.col - 1 : to.col + 1;
      newBoard[from.row][rookToCol] = newBoard[from.row][rookFromCol];
      newBoard[from.row][rookFromCol] = null;
    }

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

    setLastMove({ from, to });
    setBoard(newBoard);
    setCurrentMoveIndex(newBoardHistory.length - 1);
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
      pendingMoveRef.current = moveNotation;
      serverMoveCountRef.current = newMoveHistory.length;
      sendMoveToServer(moveNotation, finalGameStatus, winnerId);
    }
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
      case 'easy': selectedMove = moves[Math.floor(Math.random() * moves.length)]; break;
      case 'medium': selectedMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))]; break;
      case 'hard': selectedMove = getBestMove(board, moves, false); break;
      case 'master': selectedMove = getBestMove(board, moves, true); break;
      default: selectedMove = moves[0];
    }
    makeMove(selectedMove.from, selectedMove.to);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!onlineReady && isOnlineGame) return;
    if (currentPlayer !== playerColor || gameStatus !== 'playing') return;
    if (isOnlineGame && pendingMoveRef.current) return;

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
    lastMove,
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