import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

import { useState, useEffect } from 'react';

import API from '@/config/api';
const SITE_SETTINGS_URL = API.siteSettings;

interface LastGameSettings {
  opponent: 'city' | 'region' | 'country' | 'friend' | 'computer';
  time: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'master';
  color?: 'white' | 'black' | 'random';
}

const DEFAULT_REQUIREMENTS: Record<string, number> = {
  city: 500,
  region: 500,
  country: 1200
};

interface OpponentSelectStepProps {
  userCity: string;
  userRegion: string;
  lastGameSettings: LastGameSettings | null;
  onQuickStart: () => void;
  onSelect: (type: 'city' | 'region' | 'country' | 'friend' | 'computer') => void;
  getOpponentLabel: (type: string) => string;
  getTimeLabel: (time: string) => string;
  getDifficultyLabel: (difficulty?: string) => string;
}

const OpponentSelectStep = ({
  userCity,
  userRegion,
  lastGameSettings,
  onQuickStart,
  onSelect,
  getOpponentLabel,
  getTimeLabel,
  getDifficultyLabel,
}: OpponentSelectStepProps) => {
  const [lockedMsg, setLockedMsg] = useState<string | null>(null);
  const [ratingReqs, setRatingReqs] = useState<Record<string, number>>(DEFAULT_REQUIREMENTS);

  const savedUser = localStorage.getItem('chessUser');
  const userRating = savedUser ? (JSON.parse(savedUser).rating || 0) : 0;

  useEffect(() => {
    fetch(SITE_SETTINGS_URL)
      .then(r => r.json())
      .then(data => {
        const reqs: Record<string, number> = {};
        if (data.level_online_city?.value) reqs.city = parseInt(data.level_online_city.value) || 0;
        if (data.level_online_region?.value) reqs.region = parseInt(data.level_online_region.value) || 0;
        if (data.level_online_country?.value) reqs.country = parseInt(data.level_online_country.value) || 0;
        setRatingReqs(reqs);
      })
      .catch(() => {});
  }, []);

  const handleLockedSelect = (type: 'city' | 'region' | 'country' | 'friend' | 'computer') => {
    const req = ratingReqs[type];
    if (req && userRating < req) {
      setLockedMsg(`Доступно с рейтингом выше ${req}`);
      setTimeout(() => setLockedMsg(null), 3000);
      return;
    }
    onSelect(type);
  };

  const isLocked = (type: string) => {
    const req = ratingReqs[type];
    return req ? userRating < req : false;
  };

  return (
    <div className="space-y-3">
      {lockedMsg && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
            <Icon name="Lock" size={16} />
            {lockedMsg}
          </div>
        </div>
      )}
      {lastGameSettings && (
        <Button 
          className="w-full h-20 flex items-center justify-between bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 border-2 border-green-600 dark:border-green-500 shadow-lg"
          onClick={onQuickStart}
        >
          <div className="flex items-center gap-3">
            <Icon name="Zap" size={28} className="text-white" />
            <div className="text-left">
              <div className="text-base font-bold text-white">Быстрый старт</div>
              <div className="text-xs text-green-100">
                {getOpponentLabel(lastGameSettings.opponent)} • {getTimeLabel(lastGameSettings.time)}
                {lastGameSettings.difficulty && ` • ${getDifficultyLabel(lastGameSettings.difficulty)}`}
              </div>
            </div>
          </div>
          <Icon name="Play" size={24} className="text-white" />
        </Button>
      )}
      
      <Button 
        className={`w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10 ${isLocked('city') ? 'opacity-60' : ''}`}
        onClick={() => handleLockedSelect('city')}
      >
        <div className="flex items-center gap-3">
          <Icon name="Home" size={24} className="text-slate-700 dark:text-white" />
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с городом</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">
              {userCity ? `Соперники из ${userCity}` : 'Соперники из вашего города'}
            </div>
          </div>
        </div>
        {isLocked('city') ? <Icon name="Lock" size={20} className="text-red-400" /> : <Icon name="ChevronRight" size={20} className="text-slate-400" />}
      </Button>

      <Button 
        className={`w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10 ${isLocked('region') ? 'opacity-60' : ''}`}
        onClick={() => handleLockedSelect('region')}
      >
        <div className="flex items-center gap-3">
          <Icon name="Map" size={24} className="text-slate-700 dark:text-white" />
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с регионом</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">
              {userRegion ? `Соперники из ${userRegion}` : 'Соперники из вашего региона'}
            </div>
          </div>
        </div>
        {isLocked('region') ? <Icon name="Lock" size={20} className="text-red-400" /> : <Icon name="ChevronRight" size={20} className="text-slate-400" />}
      </Button>

      <Button 
        className={`w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10 ${isLocked('country') ? 'opacity-60' : ''}`}
        onClick={() => handleLockedSelect('country')}
      >
        <div className="flex items-center gap-3">
          <Icon name="Globe" size={24} className="text-slate-700 dark:text-white" />
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Играть со всей страной</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Соперники со всей России</div>
          </div>
        </div>
        {isLocked('country') ? <Icon name="Lock" size={20} className="text-red-400" /> : <Icon name="ChevronRight" size={20} className="text-slate-400" />}
      </Button>

      <Button 
        className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
        onClick={() => onSelect('friend')}
      >
        <div className="flex items-center gap-3">
          <Icon name="Users" size={24} className="text-slate-700 dark:text-white" />
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с другом</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Нерейтинговая игра</div>
          </div>
        </div>
        <Icon name="ChevronRight" size={20} className="text-slate-400" />
      </Button>

      <Button 
        className="w-full h-16 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10"
        onClick={() => onSelect('computer')}
      >
        <div className="flex items-center gap-3">
          <Icon name="Bot" size={24} className="text-slate-700 dark:text-white" />
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Играть с компьютером</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Тренировочная игра</div>
          </div>
        </div>
        <Icon name="ChevronRight" size={20} className="text-slate-400" />
      </Button>
    </div>
  );
};

export default OpponentSelectStep;