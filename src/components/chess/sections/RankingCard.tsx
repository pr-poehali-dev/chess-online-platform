import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import PlayerProfileModal from '@/components/chess/PlayerProfileModal';

interface Player {
  rank: number;
  name: string;
  rating: number;
  city: string;
  highlight?: boolean;
  avatar?: string;
}

interface RankingCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: 'blue' | 'purple' | 'orange';
  topPlayers: Player[];
  fullRanking: Player[];
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  animationDelay: string;
}

const clampName = (name: string, max = 16) =>
  name.length > max ? name.slice(0, max - 1) + '…' : name;

export const RankingCard = ({
  title,
  subtitle,
  icon,
  iconColor,
  topPlayers,
  fullRanking,
  showModal,
  setShowModal,
  animationDelay
}: RankingCardProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const colorClasses = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-600 dark:bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      highlight: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30',
      highlightText: 'text-blue-900 dark:text-blue-300'
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-600 dark:bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      highlight: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500/30',
      highlightText: 'text-purple-900 dark:text-purple-300'
    },
    orange: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-600 dark:bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      highlight: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-500/30',
      highlightText: 'text-orange-900 dark:text-orange-300'
    }
  };

  const colors = colorClasses[iconColor];

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  };

  const renderTop4 = () => {
    const first = topPlayers[0];
    const rest = topPlayers.slice(1, 4);

    return (
      <div className="flex gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-center mb-1.5">
            <div className="text-lg sm:text-xl font-bold text-yellow-400 animate-glow-text">1 место</div>
          </div>
          <div
            className="relative p-3 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 cursor-pointer hover:scale-[1.02] transition-all animate-glow-pulse"
            onClick={() => setSelectedPlayer(first)}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-yellow-400/5 dark:to-orange-400/5 pointer-events-none" />
            <div className="relative flex flex-col items-center text-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-yellow-400/20 dark:bg-yellow-400/15 blur-md animate-pulse" />
                {first.avatar ? (
                  <img src={first.avatar} alt={first.name} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-yellow-400 shadow-lg" />
                ) : (
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl text-white ${colors.bg} ring-2 ring-yellow-400 shadow-lg`}>
                    {getInitials(first.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 w-full">
                <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">{clampName(first.name)}</div>
                <div className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">{first.city}</div>
                <div className={`text-base sm:text-lg font-bold ${colors.text} mt-0.5`}>{first.rating}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {rest.map((player) => (
            <div key={player.rank} className="flex-1 flex flex-col">
              <div className="text-center mb-0.5">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400">{player.rank} место</div>
              </div>
              <div
                className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg cursor-pointer hover:border-amber-400 transition-colors flex-1 ${
                  player.rank <= 3
                    ? 'border-2 border-yellow-400/60 dark:border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-900/10'
                    : 'border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5'
                }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex-shrink-0">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs text-white ${colors.bg}`}>
                      {getInitials(player.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight">{clampName(player.name)}</div>
                  <div className={`text-xs sm:text-sm font-bold ${colors.text}`}>{player.rating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlayer = (player: Player) => {
    return (
      <div 
        key={player.rank}
        onClick={() => setSelectedPlayer(player)}
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:border-amber-400 ${
          player.highlight 
            ? colors.highlight
            : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5'
        }`}
      >
        <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${colors.bg} text-white flex-shrink-0`}>
          {player.rank}
        </div>
        <div className="flex-shrink-0">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${colors.bg}`}>
              {getInitials(player.name)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${
            player.highlight 
              ? colors.highlightText
              : 'text-gray-900 dark:text-white'
          }`}>{player.name}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{player.city}</div>
        </div>
        <div className={`text-sm font-bold ${colors.text} flex-shrink-0`}>{player.rating}</div>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay }}>
      <CardHeader className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5 sm:pb-2">
        <CardTitle className={subtitle ? "flex flex-col gap-0.5 text-gray-900 dark:text-white" : "flex items-center gap-2 text-gray-900 dark:text-white"}>
          {subtitle ? (
            <>
              <div className="flex items-center gap-2">
                <Icon name={icon} className={colors.icon} size={18} />
                <span className="text-base sm:text-lg">{title}</span>
              </div>
              <div className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400">{subtitle}</div>
            </>
          ) : (
            <>
              <Icon name={icon} className={colors.icon} size={18} />
              <span className="text-base sm:text-lg">{title}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        {renderTop4()}
        <Button
          variant="outline"
          className={`w-full border-slate-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 text-sm ${colors.hover}`}
          onClick={() => setShowModal(true)}
        >
          Полный рейтинг
          <Icon name="ChevronRight" className="ml-1" size={16} />
        </Button>
      </CardContent>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <Icon name={icon} className={colors.icon} size={20} />
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon name="X" size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              {fullRanking.map(renderPlayer)}
            </div>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <PlayerProfileModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </Card>
  );
};
