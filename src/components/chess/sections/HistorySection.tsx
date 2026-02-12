import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Move {
  move: string;
  white: string;
  black?: string;
}

interface Game {
  id: string;
  opponent: string;
  opponentRating: number;
  result: 'win' | 'loss' | 'draw';
  date: string;
  timeControl: string;
  openingName: string;
  userColor: 'white' | 'black';
  moves: Move[];
  finalPosition?: string;
}

export const HistorySection = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  useEffect(() => {
    const savedGames = localStorage.getItem('chessGames');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    } else {
      const mockGames: Game[] = [
        {
          id: '1',
          opponent: 'Александр Петров',
          opponentRating: 1920,
          result: 'win',
          date: '2026-02-12T14:30:00',
          timeControl: 'Блиц 3+2',
          openingName: 'Испанская партия',
          userColor: 'white',
          moves: [
            { move: '1', white: 'e4', black: 'e5' },
            { move: '2', white: 'Nf3', black: 'Nc6' },
            { move: '3', white: 'Bb5', black: 'a6' },
            { move: '4', white: 'Ba4', black: 'Nf6' },
            { move: '5', white: 'O-O', black: 'Be7' },
            { move: '6', white: 'd3', black: 'b5' },
            { move: '7', white: 'Bb3', black: 'd6' },
            { move: '8', white: 'c3', black: 'O-O' },
            { move: '9', white: 'h3', black: 'Na5' },
            { move: '10', white: 'Bc2', black: 'c5' },
            { move: '11', white: 'Re1', black: 'Re8' },
            { move: '12', white: 'Nbd2', black: 'Bf8' },
            { move: '13', white: 'Nf1', black: 'g6' },
            { move: '14', white: 'Ng3', black: 'Bg7' },
            { move: '15', white: 'Bg5', black: 'h6' },
            { move: '16', white: 'Bd2', black: 'Nc6' },
            { move: '17', white: 'Qe2', black: 'Be6' },
            { move: '18', white: 'Rad1', black: 'Qc7' },
            { move: '19', white: 'Nh4', black: 'Rad8' },
            { move: '20', white: 'Nhf5', black: 'Bf8' },
          ]
        },
        {
          id: '2',
          opponent: 'Мария Смирнова',
          opponentRating: 1875,
          result: 'loss',
          date: '2026-02-11T18:15:00',
          timeControl: 'Рапид 10+5',
          openingName: 'Сицилианская защита',
          userColor: 'black',
          moves: [
            { move: '1', white: 'e4', black: 'c5' },
            { move: '2', white: 'Nf3', black: 'd6' },
            { move: '3', white: 'd4', black: 'cxd4' },
            { move: '4', white: 'Nxd4', black: 'Nf6' },
            { move: '5', white: 'Nc3', black: 'a6' },
            { move: '6', white: 'Be3', black: 'e5' },
            { move: '7', white: 'Nb3', black: 'Be6' },
            { move: '8', white: 'f3', black: 'Be7' },
            { move: '9', white: 'Qd2', black: 'O-O' },
            { move: '10', white: 'O-O-O', black: 'Nbd7' },
            { move: '11', white: 'g4', black: 'b5' },
            { move: '12', white: 'g5', black: 'Nh5' },
            { move: '13', white: 'Kb1', black: 'Rc8' },
            { move: '14', white: 'Nd5', black: 'Bxd5' },
            { move: '15', white: 'exd5', black: 'Qa5' },
          ]
        },
        {
          id: '3',
          opponent: 'Дмитрий Иванов',
          opponentRating: 1835,
          result: 'draw',
          date: '2026-02-10T20:45:00',
          timeControl: 'Блиц 5+3',
          openingName: 'Французская защита',
          userColor: 'white',
          moves: [
            { move: '1', white: 'e4', black: 'e6' },
            { move: '2', white: 'd4', black: 'd5' },
            { move: '3', white: 'Nc3', black: 'Bb4' },
            { move: '4', white: 'e5', black: 'c5' },
            { move: '5', white: 'a3', black: 'Bxc3+' },
            { move: '6', white: 'bxc3', black: 'Ne7' },
            { move: '7', white: 'Qg4', black: 'Qc7' },
            { move: '8', white: 'Qxg7', black: 'Rg8' },
            { move: '9', white: 'Qxh7', black: 'cxd4' },
            { move: '10', white: 'Ne2', black: 'Nbc6' },
            { move: '11', white: 'f4', black: 'dxc3' },
            { move: '12', white: 'Qd3', black: 'Bd7' },
          ]
        },
        {
          id: '4',
          opponent: 'Елена Козлова',
          opponentRating: 1890,
          result: 'win',
          date: '2026-02-09T16:20:00',
          timeControl: 'Классика 15+10',
          openingName: 'Итальянская партия',
          userColor: 'white',
          moves: [
            { move: '1', white: 'e4', black: 'e5' },
            { move: '2', white: 'Nf3', black: 'Nc6' },
            { move: '3', white: 'Bc4', black: 'Bc5' },
            { move: '4', white: 'c3', black: 'Nf6' },
            { move: '5', white: 'd4', black: 'exd4' },
            { move: '6', white: 'cxd4', black: 'Bb4+' },
            { move: '7', white: 'Nc3', black: 'Nxe4' },
            { move: '8', white: 'O-O', black: 'Bxc3' },
            { move: '9', white: 'bxc3', black: 'd5' },
            { move: '10', white: 'Ba3', black: 'Be6' },
            { move: '11', white: 'Re1', black: 'O-O' },
            { move: '12', white: 'Rxe4', black: 'dxe4' },
            { move: '13', white: 'Ne5', black: 'Nxe5' },
            { move: '14', white: 'dxe5', black: 'Qd5' },
            { move: '15', white: 'Qe2', black: 'Rad8' },
          ]
        },
        {
          id: '5',
          opponent: 'Виктор Федоров',
          opponentRating: 1805,
          result: 'loss',
          date: '2026-02-08T12:10:00',
          timeControl: 'Блиц 3+2',
          openingName: 'Королевский гамбит',
          userColor: 'black',
          moves: [
            { move: '1', white: 'e4', black: 'e5' },
            { move: '2', white: 'f4', black: 'exf4' },
            { move: '3', white: 'Nf3', black: 'g5' },
            { move: '4', white: 'Bc4', black: 'g4' },
            { move: '5', white: 'O-O', black: 'gxf3' },
            { move: '6', white: 'Qxf3', black: 'Qf6' },
            { move: '7', white: 'd3', black: 'Bh6' },
            { move: '8', white: 'Nc3', black: 'Ne7' },
            { move: '9', white: 'Bxf4', black: 'Bxf4' },
            { move: '10', white: 'Qxf4', black: 'Qxf4' },
            { move: '11', white: 'Rxf4', black: 'd6' },
          ]
        },
      ];
      setGames(mockGames);
      localStorage.setItem('chessGames', JSON.stringify(mockGames));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400';
      case 'loss': return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400';
      case 'draw': return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-500/30 text-gray-700 dark:text-gray-400';
      default: return '';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return 'Победа';
      case 'loss': return 'Поражение';
      case 'draw': return 'Ничья';
      default: return '';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return 'TrendingUp';
      case 'loss': return 'TrendingDown';
      case 'draw': return 'Minus';
      default: return 'Circle';
    }
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setCurrentMoveIndex(0);
  };

  const handleNextMove = () => {
    if (selectedGame && currentMoveIndex < selectedGame.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const handlePrevMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleMoveClick = (index: number) => {
    setCurrentMoveIndex(index);
  };

  const stats = {
    total: games.length,
    wins: games.filter(g => g.result === 'win').length,
    losses: games.filter(g => g.result === 'loss').length,
    draws: games.filter(g => g.result === 'draw').length,
  };

  if (selectedGame) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Icon name="ChevronLeft" className="text-blue-600 dark:text-blue-400" size={24} />
                Просмотр партии
              </CardTitle>
              <Button
                onClick={() => setSelectedGame(null)}
                variant="outline"
                className="border-slate-200 dark:border-white/20"
              >
                <Icon name="X" size={18} className="mr-2" />
                Закрыть
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getResultColor(selectedGame.result)}>
                      <Icon name={getResultIcon(selectedGame.result)} size={14} className="mr-1" />
                      {getResultText(selectedGame.result)}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedGame.date)}</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedGame.userColor === 'white' ? 'Вы' : selectedGame.opponent} vs {selectedGame.userColor === 'black' ? 'Вы' : selectedGame.opponent}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedGame.openingName} • {selectedGame.timeControl} • Рейтинг соперника: {selectedGame.opponentRating}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Icon name="List" size={20} className="text-blue-600 dark:text-blue-400" />
                    Ходы партии
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                    {selectedGame.moves.map((move, index) => (
                      <div
                        key={index}
                        onClick={() => handleMoveClick(index)}
                        className={`flex gap-3 p-2 rounded cursor-pointer transition-all ${
                          index === currentMoveIndex
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="w-8 text-sm font-bold text-gray-600 dark:text-gray-400">{move.move}.</div>
                        <div className="flex-1 flex gap-4">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{move.white}</div>
                          {move.black && (
                            <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{move.black}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <Button
                      onClick={handlePrevMove}
                      disabled={currentMoveIndex === 0}
                      variant="outline"
                      className="flex-1"
                    >
                      <Icon name="ChevronLeft" size={18} className="mr-1" />
                      Назад
                    </Button>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ход {currentMoveIndex + 1} / {selectedGame.moves.length}
                    </div>
                    <Button
                      onClick={handleNextMove}
                      disabled={currentMoveIndex === selectedGame.moves.length - 1}
                      variant="outline"
                      className="flex-1"
                    >
                      Вперёд
                      <Icon name="ChevronRight" size={18} className="ml-1" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Icon name="Grid3x3" size={20} className="text-purple-600 dark:text-purple-400" />
                    Позиция на доске
                  </h3>
                  <div className="aspect-square bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-700 dark:to-amber-900 rounded-lg border-4 border-amber-800 dark:border-amber-950 flex items-center justify-center">
                    <div className="text-center text-gray-700 dark:text-gray-300">
                      <Icon name="Grid3x3" size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Позиция после хода {currentMoveIndex + 1}</p>
                      <p className="text-sm mt-2">
                        {selectedGame.moves[currentMoveIndex]?.white}
                        {selectedGame.moves[currentMoveIndex]?.black ? ` ${selectedGame.moves[currentMoveIndex].black}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="History" className="text-blue-600 dark:text-blue-400" size={24} />
            История партий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Всего партий</div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.wins}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Побед</div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.losses}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Поражений</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-500/30">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">{stats.draws}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ничьих</div>
            </div>
          </div>

          <div className="space-y-3">
            {games.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="History" className="mx-auto mb-4" size={48} />
                <p>История партий пуста</p>
                <p className="text-sm">Сыгранные партии будут отображаться здесь</p>
              </div>
            ) : (
              games.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <Badge className={getResultColor(game.result)}>
                      <Icon name={getResultIcon(game.result)} size={14} className="mr-1" />
                      {getResultText(game.result)}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {game.opponent}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                      <Icon name="TrendingUp" className="mr-1" size={12} />
                      {game.opponentRating}
                    </Badge>
                  </div>

                  <Icon name="ChevronRight" size={20} className="text-gray-400" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};