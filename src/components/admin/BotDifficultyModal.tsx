import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import API from '@/config/api';

interface Props {
  onClose: () => void;
}

interface Bot {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  strength: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: '🟢 Лёгкий',  color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/30' },
  { value: 'medium', label: '🟡 Средний', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  { value: 'hard',   label: '🟠 Сложный', color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  { value: 'master', label: '🔴 Мастер',  color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30' },
];

const DIFF_MAP: Record<string, { color: string; bg: string; emoji: string }> = {
  easy:   { color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/30',  emoji: '🟢' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', emoji: '🟡' },
  hard:   { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', emoji: '🟠' },
  master: { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30',       emoji: '🔴' },
};

const levels = [
  {
    emoji: '🟢', label: 'Лёгкий', color: 'border-green-500/30 bg-green-500/10', titleColor: 'text-green-400', delay: '~1.5 сек',
    skills: ['Ходит случайным образом — без какой-либо стратегии', 'Не оценивает позицию и не защищает фигуры', 'Может оставить под бой ферзя или короля', 'Подходит для самых начинающих игроков'],
  },
  {
    emoji: '🟡', label: 'Средний', color: 'border-yellow-500/30 bg-yellow-500/10', titleColor: 'text-yellow-400', delay: '~2.5 сек',
    skills: ['Просчитывает позицию на 2 хода вперёд', 'Высокий уровень случайности — часто выбирает не лучший ход', 'Может брать незащищённые фигуры, иногда зевает материал', 'Хорошо подходит для начинающих и любителей'],
  },
  {
    emoji: '🟠', label: 'Сложный', color: 'border-orange-500/30 bg-orange-500/10', titleColor: 'text-orange-400', delay: '~2 сек',
    skills: ['Анализирует все доступные ходы с приоритетом захватов и шахов', 'Просчитывает позицию на 3 хода вперёд (минимакс + альфа-бета)', 'Небольшой шум — изредка выбирает не идеальный ход', 'Защищает фигуры, строит угрозы, использует тактику', 'Составит хорошую партию для опытного игрока'],
  },
  {
    emoji: '🔴', label: 'Мастер', color: 'border-red-500/30 bg-red-500/10', titleColor: 'text-red-400', delay: '~1 сек',
    skills: ['Анализирует все ходы на глубину 4 уровней вперёд', 'Полностью детерминированный — всегда выбирает наилучший ход', 'Никакого шума — никогда не ошибается намеренно', 'Приоритизирует захваты, шахи и матовые угрозы', 'Умеет вести эндшпиль и использовать материальное преимущество', 'Победить практически невозможно без глубокого знания шахмат'],
  },
];

export const BotDifficultyModal = ({ onClose }: Props) => {
  const [tab, setTab] = useState<'levels' | 'bots'>('levels');
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Bot>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'bots' && bots.length === 0) {
      setLoading(true);
      fetch(API.adminBots)
        .then(r => r.json())
        .then(data => { setBots(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [tab]);

  const startEdit = (bot: Bot) => {
    setEditingId(bot.id);
    setEditValues({ name: bot.name, avatar: bot.avatar, rating: bot.rating, difficulty: bot.difficulty, strength: bot.strength });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveBot = async (bot: Bot) => {
    setSaving(bot.id);
    const payload = { id: bot.id, ...editValues };
    await fetch(API.adminBots, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBots(prev => prev.map(b => b.id === bot.id ? { ...b, ...editValues } as Bot : b));
    setSaving(null);
    setSaved(bot.id);
    setTimeout(() => setSaved(null), 1500);
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon name="Bot" size={22} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Уровни сложности бота</h2>
              <p className="text-xs text-slate-400">Навыки и управление ботами</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-700/50 px-5 flex-shrink-0">
          <button
            onClick={() => setTab('levels')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'levels' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Уровни сложности
          </button>
          <button
            onClick={() => setTab('bots')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'bots' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Список ботов
            {bots.length > 0 && <span className="ml-1.5 text-xs text-slate-500">({bots.length})</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'levels' && (
            <div className="space-y-3">
              {levels.map((lvl) => (
                <div key={lvl.label} className={`rounded-xl border p-4 ${lvl.color}`}>
                  <div className={`flex items-center gap-2 mb-3 font-bold text-sm ${lvl.titleColor}`}>
                    <span className="text-base">{lvl.emoji}</span>
                    {lvl.label}
                    <span className="ml-auto text-xs font-normal text-slate-400">задержка хода: {lvl.delay}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {lvl.skills.map((skill, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                        <span className={`mt-0.5 flex-shrink-0 text-[10px] ${lvl.titleColor}`}>◆</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-400">
                  <Icon name="Info" size={15} />
                  Как работает алгоритм
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Бот использует алгоритм <span className="text-white font-semibold">Минимакс с отсечением альфа-бета</span> —
                  тот же принцип, что в классических шахматных движках. Он просчитывает все возможные ходы на N уровней вперёд
                  и выбирает позицию с максимальной оценкой. Чем глубже поиск — тем сильнее игра.
                </p>
              </div>
            </div>
          )}

          {tab === 'bots' && (
            <div>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={24} className="text-purple-400 animate-spin" />
                </div>
              )}
              {!loading && bots.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">Не удалось загрузить ботов</div>
              )}
              {!loading && bots.length > 0 && (
                <div className="space-y-2">
                  {bots.map((bot) => {
                    const isEditing = editingId === bot.id;
                    const isSaving = saving === bot.id;
                    const isSaved = saved === bot.id;
                    const diff = DIFF_MAP[bot.difficulty] || DIFF_MAP.medium;
                    return (
                      <div key={bot.id} className={`rounded-xl border p-3 transition-all ${isEditing ? 'border-purple-500/50 bg-purple-500/5' : 'border-slate-700/40 bg-slate-700/20'}`}>
                        {!isEditing ? (
                          <div className="flex items-center gap-3">
                            <img src={bot.avatar} alt={bot.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-slate-600" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium truncate">{bot.name}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${diff.bg} ${diff.color}`}>
                                  {diff.emoji}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-slate-400 text-xs">Рейтинг: <span className="text-amber-400 font-semibold">{bot.rating}</span></span>
                                <span className="text-slate-500 text-xs">Сила: {bot.strength}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => startEdit(bot)}
                              className="p-2 rounded-lg hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                              title="Редактировать"
                            >
                              {isSaved ? <Icon name="Check" size={15} className="text-green-400" /> : <Icon name="Pencil" size={15} />}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={editValues.avatar || bot.avatar}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-slate-600"
                                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                              />
                              <div className="flex-1">
                                <label className="text-xs text-slate-400 mb-1 block">Имя</label>
                                <input
                                  value={editValues.name ?? bot.name}
                                  onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">URL аватарки</label>
                              <input
                                value={editValues.avatar ?? bot.avatar}
                                onChange={e => setEditValues(v => ({ ...v, avatar: e.target.value }))}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-slate-400 mb-1 block">Рейтинг (отображаемый)</label>
                                <input
                                  type="number"
                                  value={editValues.rating ?? bot.rating}
                                  onChange={e => setEditValues(v => ({ ...v, rating: Number(e.target.value) }))}
                                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                  min={0} max={9999}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-400 mb-1 block">Сила движка</label>
                                <input
                                  type="number"
                                  value={editValues.strength ?? bot.strength}
                                  onChange={e => setEditValues(v => ({ ...v, strength: Number(e.target.value) }))}
                                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                  min={500} max={3000}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">Уровень сложности</label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {DIFFICULTY_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => setEditValues(v => ({ ...v, difficulty: opt.value as Bot['difficulty'] }))}
                                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                                      (editValues.difficulty ?? bot.difficulty) === opt.value
                                        ? `${opt.bg} ${opt.color} border-current`
                                        : 'border-slate-600/40 text-slate-400 hover:bg-slate-700/50'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button onClick={cancelEdit} className="flex-1 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors text-sm">
                                Отмена
                              </button>
                              <button
                                onClick={() => saveBot(bot)}
                                disabled={isSaving}
                                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {isSaving ? <><Icon name="Loader2" size={14} className="animate-spin" /> Сохранение...</> : 'Сохранить'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-700/50 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors font-medium">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
