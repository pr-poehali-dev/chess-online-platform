import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { RatingSettingsModal } from '@/components/admin/RatingSettingsModal';
import { ButtonVisibilityModal } from '@/components/admin/ButtonVisibilityModal';
import { LevelAccessModal } from '@/components/admin/LevelAccessModal';

const API_URL = 'https://functions.poehali.dev/f55f4280-d8ac-4ef1-a044-74594813ca03';
const SITE_SETTINGS_URL = 'https://functions.poehali.dev/fd185e2b-db38-4c30-9ae1-efb6585bf286';

export interface RatingSettings {
  win_points: { value: string; description: string };
  loss_points: { value: string; description: string };
  draw_points: { value: string; description: string };
  daily_decay: { value: string; description: string };
  initial_rating: { value: string; description: string };
  min_rating: { value: string; description: string };
  rating_principles: { value: string; description: string };
}

export interface SiteSettings {
  [key: string]: { value: string; description: string };
}

const Admin = () => {
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showButtonsModal, setShowButtonsModal] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [settings, setSettings] = useState<RatingSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const [ratingRes, siteRes] = await Promise.all([
      fetch(API_URL),
      fetch(SITE_SETTINGS_URL)
    ]);
    const ratingData = await ratingRes.json();
    const siteData = await siteRes.json();
    setSettings(ratingData);
    setSiteSettings(siteData);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRatingSave = async (updated: Record<string, { value: string }>) => {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    await fetchSettings();
    setShowRatingModal(false);
  };

  const handleSiteSave = async (updated: Record<string, { value: string }>) => {
    await fetch(SITE_SETTINGS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    await fetchSettings();
    setShowButtonsModal(false);
    setShowLevelsModal(false);
  };

  const getButtonsDescription = () => {
    if (!siteSettings) return 'Загрузка...';
    const items = [
      { key: 'btn_play_online', label: 'Онлайн' },
      { key: 'btn_play_offline', label: 'Офлайн' },
      { key: 'btn_tournament', label: 'Турнир' },
    ];
    return items.map(i => {
      const on = siteSettings[i.key]?.value === 'true';
      return `${i.label}: ${on ? 'вкл' : 'выкл'}`;
    }).join(' | ');
  };

  const getLevelsDescription = () => {
    if (!siteSettings) return 'Загрузка...';
    const items = [
      { key: 'level_play_online', label: 'Онлайн' },
      { key: 'level_play_offline', label: 'Офлайн' },
      { key: 'level_tournament', label: 'Турнир' },
    ];
    return items.map(i => {
      const val = siteSettings[i.key]?.value || '0';
      return `${i.label}: ${val === '0' ? 'все' : `от ${val}`}`;
    }).join(' | ');
  };

  const adminItems = [
    {
      id: 'rating',
      icon: 'Trophy',
      title: 'Принципы построения рейтинга',
      description: settings 
        ? `Победа: +${settings.win_points.value} | Поражение: -${settings.loss_points.value} | Ничья: +${settings.draw_points.value} | Начальный: ${settings.initial_rating.value} | Мин: ${settings.min_rating.value}`
        : 'Загрузка...',
      onClick: () => setShowRatingModal(true)
    },
    {
      id: 'levels',
      icon: 'ShieldCheck',
      title: 'Доступы по уровням',
      description: getLevelsDescription(),
      onClick: () => setShowLevelsModal(true)
    },
    {
      id: 'buttons',
      icon: 'ToggleRight',
      title: 'Видимость кнопок на сайте',
      description: getButtonsDescription(),
      onClick: () => setShowButtonsModal(true)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Админ-панель</h1>
            <p className="text-sm text-slate-400">Управление настройками платформы</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-3">
          {adminItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 hover:border-slate-600 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={24} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium group-hover:text-amber-200 transition-colors">
                  {item.title}
                </div>
                <div className="text-sm text-slate-400 truncate mt-0.5">
                  {item.description}
                </div>
              </div>
              <Icon name="ChevronRight" size={20} className="text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </main>

      {showRatingModal && settings && (
        <RatingSettingsModal
          settings={settings}
          onSave={handleRatingSave}
          onClose={() => setShowRatingModal(false)}
        />
      )}

      {showButtonsModal && siteSettings && (
        <ButtonVisibilityModal
          settings={siteSettings}
          onSave={handleSiteSave}
          onClose={() => setShowButtonsModal(false)}
        />
      )}

      {showLevelsModal && siteSettings && (
        <LevelAccessModal
          settings={siteSettings}
          onSave={handleSiteSave}
          onClose={() => setShowLevelsModal(false)}
        />
      )}
    </div>
  );
};

export default Admin;
