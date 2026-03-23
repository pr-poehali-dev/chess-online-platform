ALTER TABLE t_p52389855_chess_online_platfor.bots
  ADD COLUMN IF NOT EXISTS city varchar(100) NOT NULL DEFAULT 'Москва',
  ADD COLUMN IF NOT EXISTS region varchar(100) NOT NULL DEFAULT 'Москва';

UPDATE t_p52389855_chess_online_platfor.bots SET city = 'Москва', region = 'Москва';