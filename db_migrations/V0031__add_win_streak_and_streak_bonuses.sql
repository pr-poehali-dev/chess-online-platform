ALTER TABLE users ADD COLUMN IF NOT EXISTS win_streak INTEGER NOT NULL DEFAULT 0;

INSERT INTO rating_settings (key, value, description) VALUES
  ('streak_bonus_3', '15', 'Бонус к рейтингу за 3 победы подряд'),
  ('streak_bonus_5', '25', 'Бонус к рейтингу за 5 побед подряд')
ON CONFLICT (key) DO NOTHING;

UPDATE rating_settings SET description = 'Принципы формирования рейтинга:
• Победа: +win_points очков
• Поражение: -loss_points очков
• Ничья: +draw_points очков
• Минимальный рейтинг: min_rating (нельзя опуститься ниже)
• Ежедневный распад: -daily_decay очков за неактивный день
• Серийный бонус: после 3 побед подряд +streak_bonus_3 очков, после 5 побед подряд +streak_bonus_5 очков'
WHERE key = 'rating_principles';
