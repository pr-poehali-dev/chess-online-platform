import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { RatingSettingsModal } from '@/components/admin/RatingSettingsModal';
import { ButtonVisibilityModal } from '@/components/admin/ButtonVisibilityModal';
import { LevelAccessModal } from '@/components/admin/LevelAccessModal';

import API from '@/config/api';
const API_URL = API.ratingSettings;
const SITE_SETTINGS_URL = API.siteSettings;
const SEND_OTP_URL = API.sendOtp;
const VERIFY_OTP_URL = API.verifyOtp;
const ADMIN_AUTH_URL = API.adminAuth;

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

const AdminLogin = ({ onSuccess }: { onSuccess: (email: string) => void }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const sendOtp = useCallback(async () => {
    setIsSending(true);
    setError('');
    try {
      const res = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setResendTimer(60);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Не удалось отправить код');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setIsSending(false);
    }
  }, [email]);

  const verifyOtp = useCallback(async () => {
    setIsVerifying(true);
    setError('');
    try {
      const verifyRes = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode.trim(), mode: 'admin' })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        if (verifyData.error === 'Invalid code') {
          setError('Неверный код');
        } else if (verifyData.error === 'Code expired or not found') {
          setError('Код истёк. Запросите новый.');
        } else {
          setError(verifyData.message || verifyData.error || 'Ошибка проверки');
        }
        return;
      }

      const authRes = await fetch(ADMIN_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const authData = await authRes.json();
      if (authRes.ok && authData.success) {
        const adminEmail = email.trim().toLowerCase();
        sessionStorage.setItem('adminAuth', JSON.stringify({ email: adminEmail, ts: Date.now() }));
        onSuccess(adminEmail);
      } else {
        setError(authData.message || 'Нет доступа к админ-панели');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setIsVerifying(false);
    }
  }, [email, otpCode, onSuccess]);

  const digits = otpCode.padEnd(6, '').split('').slice(0, 6);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || '';
      setOtpCode(newDigits.join(''));
      if (pasted.length >= 6) inputRefs.current[5]?.focus();
      return;
    }
    newDigits[index] = value;
    setOtpCode(newDigits.join(''));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter' && otpCode.replace(/\s/g, '').length === 6) verifyOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Icon name="Shield" size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
          <p className="text-slate-400 mt-1">Войдите с помощью одноразового кода</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 space-y-4">
          {step === 'email' && (
            <>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Email администратора</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && email.includes('@') && sendOtp()}
                  placeholder="admin@example.com"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 border-0"
                onClick={sendOtp}
                disabled={!email.includes('@') || isSending}
              >
                {isSending ? (
                  <><Icon name="Loader2" className="mr-2 animate-spin" size={20} />Отправляем код...</>
                ) : (
                  <><Icon name="Mail" className="mr-2" size={20} />Получить код</>
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <p className="text-sm text-slate-300 text-center">
                Код отправлен на <span className="font-medium text-white">{email}</span>
              </p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={i === 0 ? 6 : 1}
                    value={digits[i] || ''}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-11 h-14 text-center text-2xl font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                      error
                        ? 'border-red-500 bg-red-900/20 text-red-400'
                        : 'border-slate-600 bg-slate-700/50 text-white'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 border-0"
                onClick={verifyOtp}
                disabled={otpCode.replace(/\s/g, '').length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <><Icon name="Loader2" className="mr-2 animate-spin" size={20} />Проверяем...</>
                ) : (
                  <><Icon name="Check" className="mr-2" size={20} />Войти</>
                )}
              </Button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setStep('email'); setOtpCode(''); setError(''); }}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Изменить email
                </button>
                {resendTimer > 0 ? (
                  <span className="text-xs text-slate-500">Повторно через {resendTimer} сек</span>
                ) : (
                  <button
                    onClick={() => { setOtpCode(''); setError(''); sendOtp(); }}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Отправить повторно
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ADMIN_STATS_URL = API.adminStats;

const AdminPanel = ({ adminEmail, onLogout }: { adminEmail: string; onLogout: () => void }) => {
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showButtonsModal, setShowButtonsModal] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [settings, setSettings] = useState<RatingSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ total_users: number; online_users: number; active_games: number } | null>(null);
  const [wipeStep, setWipeStep] = useState(0);
  const [wiping, setWiping] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(ADMIN_STATS_URL);
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
  };

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
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleWipe = async () => {
    if (wipeStep === 0) {
      setWipeStep(1);
      return;
    }
    if (wipeStep === 1) {
      setWipeStep(2);
      return;
    }
    setWiping(true);
    try {
      await fetch(ADMIN_STATS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'wipe_all', admin_email: adminEmail })
      });
      await fetchStats();
    } catch { /* ignore */ }
    setWiping(false);
    setWipeStep(0);
  };

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
      { key: 'level_online_city', label: 'Город' },
      { key: 'level_online_region', label: 'Регион' },
      { key: 'level_online_country', label: 'Россия' },
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
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats?.total_users ?? '—'}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Icon name="Users" size={14} className="text-blue-400" />
                Игроков
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats?.online_users ?? '—'}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Icon name="Wifi" size={14} className="text-green-400" />
                Онлайн
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{stats?.active_games ?? '—'}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Icon name="Swords" size={14} className="text-amber-400" />
                Партий
              </div>
            </div>
          </div>

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

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            {wipeStep === 0 && (
              <button
                onClick={handleWipe}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-900/20 border border-red-800/40 hover:bg-red-900/40 hover:border-red-700 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Trash2" size={24} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-red-300 font-medium group-hover:text-red-200 transition-colors">
                    Очистить все данные
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    Удалить всех игроков, партии, историю. Всем нужна новая регистрация.
                  </div>
                </div>
              </button>
            )}

            {wipeStep === 1 && (
              <div className="p-4 rounded-xl bg-red-900/30 border border-red-700/50 space-y-3">
                <div className="flex items-center gap-2 text-red-300">
                  <Icon name="AlertTriangle" size={20} />
                  <span className="font-bold">Удалить все аккаунты и партии?</span>
                </div>
                <p className="text-sm text-slate-400">Все игроки потеряют аккаунты, рейтинг и историю. Действие необратимо.</p>
                <div className="flex gap-2">
                  <button onClick={() => setWipeStep(0)} className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm transition-colors">
                    Отмена
                  </button>
                  <button onClick={handleWipe} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors">
                    Да, удалить всё
                  </button>
                </div>
              </div>
            )}

            {wipeStep === 2 && (
              <div className="p-4 rounded-xl bg-red-900/40 border border-red-600/60 space-y-3">
                <div className="flex items-center gap-2 text-red-200">
                  <Icon name="Skull" size={20} />
                  <span className="font-bold">Точно грохнуть базу? Последний шанс!</span>
                </div>
                <p className="text-sm text-red-300/80">Это действие НЕЛЬЗЯ отменить. Вся база игроков будет стёрта.</p>
                <div className="flex gap-2">
                  <button onClick={() => setWipeStep(0)} className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm transition-colors">
                    Нет, отменить
                  </button>
                  <button onClick={handleWipe} disabled={wiping} className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-sm transition-colors disabled:opacity-50">
                    {wiping ? 'Удаляю...' : 'ГРОХНУТЬ ВСЁ'}
                  </button>
                </div>
              </div>
            )}
          </div>
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