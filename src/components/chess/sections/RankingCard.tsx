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
      <div className="flex gap-3 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-center mb-2">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400 animate-glow-text">1 место</div>
          </div>
          <div
            className="relative p-3 sm:p-4 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 cursor-pointer hover:scale-[1.02] transition-all animate-glow-pulse"
            onClick={() => setSelectedPlayer(first)}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-yellow-400/5 dark:to-orange-400/5 pointer-events-none" />
            <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-yellow-400/20 dark:bg-yellow-400/15 blur-md animate-pulse" />
                {first.avatar ? (
                  <img src={first.avatar} alt={first.name} className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-[3px] ring-yellow-400 shadow-lg" />
                ) : (
                  <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl text-white ${colors.bg} ring-[3px] ring-yellow-400 shadow-lg`}>
                    {getInitials(first.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 sm:truncate">{first.name}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{first.city}</div>
                <div className={`text-lg sm:text-xl font-bold ${colors.text} mt-1`}>{first.rating}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {rest.map((player) => (
            <div key={player.rank} className="flex-1">
              <div className="text-center mb-1">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{player.rank} место</div>
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:border-amber-400 transition-colors ${
                  player.rank <= 3
                    ? 'border-2 border-yellow-400/60 dark:border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-900/10'
                    : 'border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5'
                }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex-shrink-0">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-white ${colors.bg}`}>
                      {getInitials(player.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 sm:truncate leading-tight">{player.name}</div>
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
        <div className="flex-1">
          <div className={`font-semibold text-sm ${
            player.highlight 
              ? colors.highlightText
              : 'text-gray-900 dark:text-white'
          }`}>{player.name}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{player.city}</div>
        </div>
        <div className={`text-sm font-bold ${colors.text}`}>{player.rating}</div>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in" style={{ animationDelay }}>
      <CardHeader>
        <CardTitle className={subtitle ? "flex flex-col gap-1 text-gray-900 dark:text-white" : "flex items-center gap-2 text-gray-900 dark:text-white"}>
          {subtitle ? (
            <>
              <div className="flex items-center gap-2">
                <Icon name={icon} className={colors.icon} size={20} />
                {title}
              </div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">{subtitle}</div>
            </>
          ) : (
            <>
              <Icon name={icon} className={colors.icon} size={20} />
              {title}
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderTop4()}
        
        {showModal && (
          <div className="space-y-3 animate-slide-down">
            {fullRanking.slice(4).map((player) => renderPlayer(player))}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className={`w-full mt-4 ${colors.text} ${colors.border} ${colors.hover}`}
          onClick={() => setShowModal(!showModal)}
        >
          {showModal ? 'Скрыть список' : 'Показать больше'}
          <Icon name={showModal ? "ChevronUp" : "ChevronDown"} size={16} className="ml-2" />
        </Button>
      </CardContent>
      <PlayerProfileModal
        open={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        playerName={selectedPlayer?.name || ''}
        playerAvatar={selectedPlayer?.avatar}
        playerRating={selectedPlayer?.rating}
      />
    </Card>
  );
};