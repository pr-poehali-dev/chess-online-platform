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
      border: 'border-blue-200 dark:border-blue-800',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      highlight: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30',
      highlightText: 'text-blue-900 dark:text-blue-300'
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-600 dark:bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      highlight: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500/30',
      highlightText: 'text-purple-900 dark:text-purple-300'
    },
    orange: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-600 dark:bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      highlight: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-500/30',
      highlightText: 'text-orange-900 dark:text-orange-300'
    }
  };

  const colors = colorClasses[iconColor];

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderTop4 = () => {
    const first = topPlayers[0];
    const rest = topPlayers.slice(1, 4);

    return (
      <div className="flex gap-4 sm:gap-5 mb-5">
        <div className="flex-1 min-w-0">
          <div className="text-center mb-2 sm:mb-3">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 animate-glow-text">1 место</div>
          </div>
          <div
            className="relative p-4 sm:p-5 md:p-6 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 cursor-pointer hover:scale-[1.02] transition-all animate-glow-pulse"
            onClick={() => setSelectedPlayer(first)}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-yellow-400/5 dark:to-orange-400/5 pointer-events-none" />
            <div className="relative flex flex-col items-center text-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-yellow-400/20 dark:bg-yellow-400/15 blur-md animate-pulse" />
                {first.avatar ? (
                  <img src={first.avatar} alt={first.name} className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover ring-[3px] ring-yellow-400 shadow-lg" />
                ) : (
                  <div className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl text-white ${colors.bg} ring-[3px] ring-yellow-400 shadow-lg`}>
                    {getInitials(first.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="font-bold text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-white line-clamp-2 sm:truncate leading-tight">{first.name}</div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5">{first.city}</div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${colors.text} mt-1.5`}>{first.rating}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 min-w-0 flex-1">
          {rest.map((player) => (
            <div key={player.rank} className="flex-1">
              <div className="text-center mb-1">
                <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">{player.rank} место</div>
              </div>
              <div
                className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer hover:border-amber-400 transition-colors ${
                  player.rank <= 3
                    ? 'border-2 border-yellow-400/60 dark:border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-900/10'
                    : 'border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5'
                }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex-shrink-0">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover" />
                  ) : (
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-sm sm:text-base text-white ${colors.bg}`}>
                      {getInitials(player.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 leading-tight">{player.name}</div>
                  <div className={`text-sm sm:text-base font-bold ${colors.text} mt-0.5`}>{player.rating}</div>
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
        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-colors hover:border-amber-400 ${
          player.highlight 
            ? colors.highlight
            : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5'
        }`}
      >
        <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-sm sm:text-base ${colors.bg} text-white flex-shrink-0`}>
          {player.rank}
        </div>
        <div className="flex-shrink-0">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
          ) : (
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm text-white ${colors.bg}`}>
              {getInitials(player.name)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className={`font-semibold text-sm sm:text-base ${
            player.highlight 
              ? colors.highlightText
              : 'text-gray-900 dark:text-white'
          }`}>{player.name}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{player.city}</div>
        </div>
        <div className={`text-sm sm:text-base font-bold ${colors.text}`}>{player.rating}</div>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in rounded-2xl" style={{ animationDelay }}>
      <CardHeader className="p-5 sm:p-6 md:p-7">
        <CardTitle className={subtitle ? "flex flex-col gap-1.5 text-gray-900 dark:text-white" : "flex items-center gap-2 text-gray-900 dark:text-white"}>
          {subtitle ? (
            <>
              <div className="flex items-center gap-2.5">
                <Icon name={icon} className={colors.icon} size={24} />
                <span className="text-lg sm:text-xl md:text-2xl">{title}</span>
              </div>
              <div className="text-sm sm:text-base font-normal text-gray-600 dark:text-gray-400">{subtitle}</div>
            </>
          ) : (
            <>
              <Icon name={icon} className={colors.icon} size={24} />
              <span className="text-lg sm:text-xl md:text-2xl">{title}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6 md:px-7 md:pb-7 pt-0">
        {renderTop4()}
        <Button
          variant="outline"
          className={`w-full mt-2 border-slate-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-3 sm:py-4 text-sm sm:text-base rounded-xl ${colors.hover}`}
          onClick={() => setShowModal(true)}
        >
          Полный рейтинг
          <Icon name="ChevronRight" className="ml-1" size={18} />
        </Button>
      </CardContent>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
              <div className="flex items-center gap-2.5">
                <Icon name={icon} className={colors.icon} size={24} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon name="X" size={22} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
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
