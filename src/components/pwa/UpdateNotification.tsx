import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { onUpdateAvailable, applyUpdate } from '@/lib/serviceWorker';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    onUpdateAvailable(() => setShowUpdate(true));
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
      <div className="bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl shadow-black/50 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <Icon name="RefreshCw" size={16} className="text-green-400" />
        </div>
        <div className="text-sm text-white">Доступно обновление</div>
        <button
          onClick={applyUpdate}
          className="bg-green-500 hover:bg-green-600 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Обновить
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
