import json
import os
import psycopg2


def get_client_ip(event):
    hdrs = event.get('headers') or {}
    ip = hdrs.get('X-Forwarded-For', hdrs.get('x-forwarded-for', ''))
    if ip:
        ip = ip.split(',')[0].strip()
    if not ip:
        ip = hdrs.get('X-Real-Ip', hdrs.get('x-real-ip', ''))
    if not ip:
        rc = event.get('requestContext') or {}
        ip = (rc.get('identity') or {}).get('sourceIp', 'unknown')
    return ip or 'unknown'


def check_rate_limit(cur, conn, ip, endpoint, max_requests, window_seconds):
    try:
        cur.execute(
            "SELECT id, request_count FROM rate_limits WHERE ip_address = '%s' AND endpoint = '%s' AND window_start > NOW() - INTERVAL '%d seconds' LIMIT 1"
            % (ip.replace("'", "''"), endpoint.replace("'", "''"), window_seconds)
        )
        row = cur.fetchone()
        if row and row[1] >= max_requests:
            return True
        if row:
            cur.execute("UPDATE rate_limits SET request_count = request_count + 1 WHERE id = %d" % row[0])
        else:
            cur.execute(
                "INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start) VALUES ('%s', '%s', 1, NOW())"
                % (ip.replace("'", "''"), endpoint.replace("'", "''"))
            )
        conn.commit()
        return False
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        return False


def handler(event: dict, context) -> dict:
    """Завершение партии: обновление рейтинга игрока и запись в историю"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    client_ip = get_client_ip(event)
    if check_rate_limit(cur, conn, client_ip, 'finish-game', 10, 60):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}
    cur.close()
    conn.close()

    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id', '')
    username = body.get('username', 'Player')
    avatar = body.get('avatar', '')
    result = body.get('result', '')
    opponent_name = body.get('opponent_name', '')
    opponent_type = body.get('opponent_type', 'bot')
    opponent_rating = body.get('opponent_rating')
    user_color = body.get('user_color', 'white')
    time_control = body.get('time_control', '10+0')
    difficulty = body.get('difficulty')
    moves_count = body.get('moves_count', 0)
    move_history = body.get('move_history', '')
    move_times = body.get('move_times', '')
    duration_seconds = body.get('duration_seconds')
    end_reason = body.get('end_reason', 'checkmate')

    if not user_id or result not in ('win', 'loss', 'draw'):
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id and valid result required'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT key, value FROM rating_settings")
    settings_rows = cur.fetchall()
    settings = {r[0]: r[1] for r in settings_rows}

    initial_rating = int(settings.get('initial_rating', '1200'))
    min_rating = int(settings.get('min_rating', '500'))

    # Рейтинг меняется в онлайн-играх и при игре с ботом через матчмейкинг
    rating_active = opponent_type != 'bot'

    cur.execute("SELECT id, rating, games_played, wins, losses, draws, win_streak, streak_opponents FROM users WHERE id = '%s'" % user_id.replace("'", "''"))
    user = cur.fetchone()

    if not user:
        cur.execute(
            "INSERT INTO users (id, username, avatar, rating, games_played, wins, losses, draws, win_streak, streak_opponents) VALUES ('%s', '%s', '%s', %d, 0, 0, 0, 0, 0, '')"
            % (user_id.replace("'", "''"), username.replace("'", "''"), avatar.replace("'", "''"), initial_rating)
        )
        conn.commit()
        current_rating = initial_rating
        games_played = 0
        wins = 0
        losses = 0
        draws = 0
        win_streak = 0
        streak_opponents = []
    else:
        current_rating = user[1]
        games_played = user[2]
        wins = user[3]
        losses = user[4]
        draws = user[5]
        win_streak = user[6] if user[6] is not None else 0
        streak_opponents_str = user[7] or ''
        streak_opponents = [x for x in streak_opponents_str.split(',') if x] if streak_opponents_str else []

    streak_bonus = 0
    diverse_streak_bonus = 0  # бонус за 3 победы с разными соперниками
    diverse_streak_triggered = False

    if result == 'win':
        wins += 1
        if rating_active:
            win_streak += 1
            # Добавляем соперника в список серии (по имени)
            opp_key = (opponent_name or 'unknown').strip()
            streak_opponents.append(opp_key)
            # Проверяем: последние 3 победы с разными соперниками
            if len(streak_opponents) >= 3:
                last_3 = streak_opponents[-3:]
                if len(set(last_3)) == 3:  # все три разные
                    diverse_streak_bonus = int(settings.get('streak_bonus_3', '25'))
                    diverse_streak_triggered = True
                    streak_opponents = []  # сбрасываем счётчик после начисления
    elif result == 'loss':
        losses += 1
        if rating_active:
            win_streak = 0
            streak_opponents = []
    else:
        draws += 1
        if rating_active:
            win_streak = 0
            streak_opponents = []

    if rating_active:
        win_points = int(settings.get('win_points', '25'))
        loss_points = int(settings.get('loss_points', '15'))
        draw_points = int(settings.get('draw_points', '5'))

        if result == 'win':
            rating_change = win_points + diverse_streak_bonus
            streak_bonus = diverse_streak_bonus
        elif result == 'loss':
            rating_change = -loss_points
        else:
            rating_change = draw_points

        new_rating = current_rating + rating_change
        if new_rating < min_rating:
            new_rating = min_rating
            # rating_change сохраняем оригинальным (не 0), чтобы показать игроку реальное изменение
    else:
        rating_change = 0
        new_rating = current_rating

    games_played += 1
    streak_opponents_str = ','.join(streak_opponents[-10:])  # храним не более 10

    cur.execute(
        "UPDATE users SET rating = %d, games_played = %d, wins = %d, losses = %d, draws = %d, win_streak = %d, streak_opponents = '%s', updated_at = NOW() WHERE id = '%s'"
        % (new_rating, games_played, wins, losses, draws, win_streak, streak_opponents_str.replace("'", "''"), user_id.replace("'", "''"))
    )

    # Обновляем рейтинг бота (обратно результату игрока) при игре через матчмейкинг
    if rating_active and opponent_type == 'matchmaking_bot' and opponent_name:
        bot_rating_change = -rating_change
        cur.execute("SELECT rating FROM bots WHERE name = '%s' LIMIT 1" % opponent_name.replace("'", "''"))
        bot_row = cur.fetchone()
        if bot_row:
            new_bot_rating = max(min_rating, bot_row[0] + bot_rating_change)
            cur.execute("UPDATE bots SET rating = %d WHERE name = '%s'" % (new_bot_rating, opponent_name.replace("'", "''")))

    move_history_escaped = move_history.replace("'", "''") if move_history else ''
    move_times_escaped = move_times.replace("'", "''") if move_times else ''
    opponent_name_escaped = opponent_name.replace("'", "''")
    difficulty_val = "'%s'" % difficulty.replace("'", "''") if difficulty else 'NULL'
    opponent_rating_val = str(opponent_rating) if opponent_rating else 'NULL'
    duration_val = str(duration_seconds) if duration_seconds else 'NULL'

    cur.execute(
        """INSERT INTO game_history 
        (user_id, opponent_name, opponent_type, opponent_rating, result, user_color, time_control, difficulty, moves_count, move_history, move_times, rating_before, rating_after, rating_change, duration_seconds, end_reason)
        VALUES ('%s', '%s', '%s', %s, '%s', '%s', '%s', %s, %d, '%s', '%s', %d, %d, %d, %s, '%s')
        RETURNING id"""
        % (
            user_id.replace("'", "''"),
            opponent_name_escaped,
            opponent_type.replace("'", "''"),
            opponent_rating_val,
            result,
            user_color,
            time_control.replace("'", "''"),
            difficulty_val,
            moves_count,
            move_history_escaped,
            move_times_escaped,
            current_rating,
            new_rating,
            rating_change,
            duration_val,
            end_reason.replace("'", "''")
        )
    )
    game_id = cur.fetchone()[0]

    # Получаем актуальный рейтинг бота для возврата фронтенду
    bot_rating_after = None
    if opponent_type == 'matchmaking_bot' and opponent_name:
        cur.execute("SELECT rating FROM bots WHERE name = '%s' LIMIT 1" % opponent_name.replace("'", "''"))
        bot_row2 = cur.fetchone()
        if bot_row2:
            bot_rating_after = bot_row2[0]

    conn.commit()
    cur.close()
    conn.close()

    resp = {
        'game_id': game_id,
        'rating_before': current_rating,
        'rating_after': new_rating,
        'rating_change': rating_change,
        'streak_bonus': streak_bonus,
        'diverse_streak_triggered': diverse_streak_triggered,
        'win_streak': win_streak,
        'games_played': games_played,
        'wins': wins,
        'losses': losses,
        'draws': draws
    }
    if bot_rating_after is not None:
        resp['opponent_rating_after'] = bot_rating_after

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(resp)
    }