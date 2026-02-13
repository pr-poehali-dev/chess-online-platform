import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { RatingSettings } from '@/pages/Admin';

interface Props {
  settings: RatingSettings;
  onSave: (updated: Record<string, { value: string }>) => Promise<void>;
  onClose: () => void;
}

export const RatingSettingsModal = ({ settings, onSave, onClose }: Props) => {
  const [winPoints, setWinPoints] = useState(settings.win_points.value);
  const [lossPoints, setLossPoints] = useState(settings.loss_points.value);
  const [drawPoints, setDrawPoints] = useState(settings.draw_points.value);
  const [dailyDecay, setDailyDecay] = useState(settings.daily_decay.value);
  const [initialRating, setInitialRating] = useState(settings.initial_rating.value);
  const [principles, setPrinciples] = useState(settings.rating_principles.value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      win_points: { value: winPoints },
      loss_points: { value: lossPoints },
      draw_points: { value: drawPoints },
      daily_decay: { value: dailyDecay },
      initial_rating: { value: initialRating },
      rating_principles: { value: principles }
    });
    setSaving(false);
  };

  const fields = [
    { label: 'Баллы за победу', value: winPoints, onChange: setWinPoints, icon: 'Plus', color: 'text-green-400' },
    { label: 'Баллы за поражение', value: lossPoints, onChange: setLossPoints, icon: 'Minus', color: 'text-red-400' },
    { label: 'Баллы за ничью', value: drawPoints, onChange: setDrawPoints, icon: 'Equal', color: 'text-yellow-400' },
    { label: 'Ежедневное снижение', value: dailyDecay, onChange: setDailyDecay, icon: 'TrendingDown', color: 'text-orange-400' },
    { label: 'Начальный рейтинг', value: initialRating, onChange: setInitialRating, icon: 'Star', color: 'text-blue-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Icon name="Trophy" size={22} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Принципы рейтинга</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.label} className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={f.icon} size={16} className={f.color} />
                  <label className="text-xs text-slate-400">{f.label}</label>
                </div>
                <input
                  type="number"
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="FileText" size={16} className="text-slate-400" />
              <label className="text-sm text-slate-400">Описание принципов рейтинга</label>
            </div>
            <textarea
              value={principles}
              onChange={(e) => setPrinciples(e.target.value)}
              rows={6}
              className="w-full bg-slate-700/40 border border-slate-600/30 rounded-xl px-4 py-3 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              placeholder="Опишите принципы начисления и списания рейтинговых баллов..."
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors font-bold disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};
