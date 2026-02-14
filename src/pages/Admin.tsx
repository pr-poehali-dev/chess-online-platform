import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { RatingSettingsModal } from '@/components/admin/RatingSettingsModal';
import { ButtonVisibilityModal } from '@/components/admin/ButtonVisibilityModal';
import { LevelAccessModal } from '@/components/admin/LevelAccessModal';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminStatsCards from '@/pages/admin/AdminStatsCards';
import AdminWipeSection from '@/pages/admin/AdminWipeSection';

import API from '@/config/api';
const API_URL = API.ratingSettings;
const SITE_SETTINGS_URL = API.siteSettings;
const ADMIN_STATS_URL = API.adminStats;

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

const AdminPanel = ({ adminEmail, onLogout }: { adminEmail: string; onLogout: () => void }) => {
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showButtonsModal, setShowButtonsModal] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [settings, setSettings] = useState<RatingSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [stats, setStats] = useState<{ total_users: number; online_users: number; active_games: number } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(ADMIN_STATS_URL);
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
  };

  const fetchSettings = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [ratingRes, siteRes] = await Promise.all([
        fetch(API_URL),
        fetch(SITE_SETTINGS_URL)
      ]);
      const ratingData = await ratingRes.json();
      const siteData = await siteRes.json();
      setSettings(ratingData);
      setSiteSettings(siteData);
    } catch {
      setLoadError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
    fetchStats();
    const interval = setInterval(fetchStats, 180000);
    return () => clearInterval(interval);
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
    if (!siteSettings) return loadError ? 'Нажмите, чтобы повторить загрузку' : 'Загрузка...';
    const items = [
      { key: 'btn_play_online', label: 'Онлайн' },
      { key: 'btn_play_offline', label: 'Офлайн' },
      { key: 'btn_tournament', label: 'Турнир' },
      { key: 'btn_rankings', label: 'Рейтинги' },
    ];
    return items.map(i => {
      const on = siteSettings[i.key]?.value === 'true';
      return `${i.label}: ${on ? 'вкл' : 'выкл'}`;
    }).join(' | ');
  };

  const getLevelsDescription = () => {
    if (!siteSettings) return loadError ? 'Нажмите, чтобы повторить загрузку' : 'Загрузка...';
    const items = [
      { key: 'level_play_online', label: 'Онлайн' },
      { key: 'level_play_offline', label: 'Офлайн' },
      { key: 'level_tournament', label: 'Турнир' },
      { key: 'level_online_city', label: 'Город' },
      { key: 'level_online_region', label: 'Регион' },
      { key: 'level_online_country', label: 'Россия' },
    ];
    return items.map(i => {
      const val = siteSettings[i.key]?.value || '0';
      return `${i.label}: ${val === '0' ? 'все' : `от ${val}`}`;
    }).join(' | ');
  };

  const openWithRetry = async (openFn: () => void) => {
    if (!settings || !siteSettings) {
      await fetchSettings();
    }
    openFn();
  };

  const adminItems = [
    {
      id: 'rating',
      icon: 'Trophy',
      title: 'Принципы построения рейтинга',
      description: settings
        ? `Победа: +${settings.win_points.value} | Поражение: -${settings.loss_points.value} | Ничья: +${settings.draw_points.value} | Начальный: ${settings.initial_rating.value} | Мин: ${settings.min_rating.value}`
        : loadError ? 'Нажмите, чтобы повторить загрузку' : 'Загрузка...',
      onClick: () => openWithRetry(() => setShowRatingModal(true))
    },
    {
      id: 'levels',
      icon: 'ShieldCheck',
      title: 'Доступы по уровням',
      description: getLevelsDescription(),
      onClick: () => openWithRetry(() => setShowLevelsModal(true))
    },
    {
      id: 'buttons',
      icon: 'ToggleRight',
      title: 'Видимость кнопок на сайте',
      description: getButtonsDescription(),
      onClick: () => openWithRetry(() => setShowButtonsModal(true))
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Админ-панель</h1>
              <p className="text-sm text-slate-400">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors text-sm"
          >
            <Icon name="LogOut" size={16} />
            Выйти
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <AdminStatsCards stats={stats} />

          {adminItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
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
              {loading ? (
                <Icon name="Loader2" size={20} className="text-slate-500 animate-spin flex-shrink-0" />
              ) : (
                <Icon name="ChevronRight" size={20} className="text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
              )}
            </button>
          ))}

          <AdminWipeSection adminEmail={adminEmail} onWipeComplete={fetchStats} />
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

const Admin = () => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('adminAuth');
    if (saved) {
      const data = JSON.parse(saved);
      const hourAgo = Date.now() - 60 * 60 * 1000;
      if (data.ts > hourAgo) {
        setAdminEmail(data.email);
      } else {
        sessionStorage.removeItem('adminAuth');
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setAdminEmail(null);
  };

  if (!adminEmail) {
    return <AdminLogin onSuccess={setAdminEmail} />;
  }

  return <AdminPanel adminEmail={adminEmail} onLogout={handleLogout} />;
};

export default Admin;