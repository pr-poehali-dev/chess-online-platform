import json
import os
import psycopg2
import random

BOT_NAMES = [
    'Бот Каспаров', 'Бот Карлсен', 'Бот Фишер', 'Бот Таль',
    'Бот Капабланка', 'Бот Алехин', 'Бот Корчной', 'Бот Петросян'
]

def get_initial_time(time_control):
    """Получить начальное время в секундах из контроля времени"""
    if '+' in time_control:
        parts = time_control.split('+')
        return int(parts[0]) * 60
    mapping = {'blitz': 180, 'rapid': 600, 'classic': 900}
    return mapping.get(time_control, 600)


def handler(event: dict, context) -> dict:
    """Матчмейкинг: поиск соперника по рейтингу ±50, если нет — предлагает бота"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') == 'DELETE':
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('user_id', '')
        if not user_id:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute("DELETE FROM matchmaking_queue WHERE user_id = '%s'" % user_id.replace("'", "''"))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'removed'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        game_id = qs.get('game_id', '')
        user_id = qs.get('user_id', '')
        if game_id:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            cur.execute("SELECT id, white_user_id, white_username, white_avatar, white_rating, black_user_id, black_username, black_avatar, black_rating, time_control, status, is_bot_game, current_player, white_time, black_time, move_history, board_state, winner, end_reason FROM online_games WHERE id = %d" % int(game_id))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'game': {
                    'id': row[0], 'white_user_id': row[1], 'white_username': row[2], 'white_avatar': row[3], 'white_rating': row[4],
                    'black_user_id': row[5], 'black_username': row[6], 'black_avatar': row[7], 'black_rating': row[8],
                    'time_control': row[9], 'status': row[10], 'is_bot_game': row[11], 'current_player': row[12],
                    'white_time': row[13], 'black_time': row[14], 'move_history': row[15], 'board_state': row[16],
                    'winner': row[17], 'end_reason': row[18]
                }
            })}
        if user_id:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            cur.execute("SELECT id FROM matchmaking_queue WHERE user_id = '%s'" % user_id.replace("'", "''"))
            in_queue = cur.fetchone()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'in_queue': bool(in_queue)})}
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id or user_id required'})}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    action = body.get('action', 'search')
    user_id = body.get('user_id', '')
    username = body.get('username', 'Player')
    avatar = body.get('avatar', '')
    user_rating = body.get('rating', 1200)
    opponent_type = body.get('opponent_type', 'country')
    time_control = body.get('time_control', 'rapid')

    if not user_id:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if action == 'play_bot':
        cur.execute("DELETE FROM matchmaking_queue WHERE user_id = '%s'" % user_id.replace("'", "''"))

        assign_white = random.random() < 0.5
        bot_name = random.choice(BOT_NAMES)
        bot_rating = user_rating + random.randint(-30, 30)
        initial_time = get_initial_time(time_control)

        if assign_white:
            w_uid, w_name, w_avatar, w_rating = user_id, username, avatar, user_rating
            b_uid, b_name, b_avatar, b_rating = 'bot', bot_name, '', bot_rating
        else:
            w_uid, w_name, w_avatar, w_rating = 'bot', bot_name, '', bot_rating
            b_uid, b_name, b_avatar, b_rating = user_id, username, avatar, user_rating

        cur.execute(
            """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating, black_user_id, black_username, black_avatar, black_rating, time_control, opponent_type, is_bot_game, white_time, black_time)
            VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', '%s', TRUE, %d, %d) RETURNING id"""
            % (w_uid.replace("'", "''"), w_name.replace("'", "''"), w_avatar.replace("'", "''"), w_rating,
               b_uid.replace("'", "''"), b_name.replace("'", "''"), b_avatar.replace("'", "''"), b_rating,
               time_control.replace("'", "''"), opponent_type.replace("'", "''"), initial_time, initial_time)
        )
        game_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        player_color = 'white' if assign_white else 'black'
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'status': 'bot_game',
            'game_id': game_id,
            'player_color': player_color,
            'opponent_name': bot_name,
            'opponent_rating': bot_rating
        })}

    cur.execute("SELECT id FROM matchmaking_queue WHERE user_id = '%s'" % user_id.replace("'", "''"))
    already_in = cur.fetchone()

    any_rating = body.get('any_rating', False)

    if any_rating:
        cur.execute(
            "SELECT user_id, username, avatar, rating, time_control FROM matchmaking_queue WHERE user_id != '%s' AND time_control = '%s' ORDER BY ABS(rating - %d) LIMIT 1"
            % (user_id.replace("'", "''"), time_control.replace("'", "''"), user_rating)
        )
    else:
        rating_min = user_rating - 50
        rating_max = user_rating + 50
        cur.execute(
            "SELECT user_id, username, avatar, rating, time_control FROM matchmaking_queue WHERE user_id != '%s' AND time_control = '%s' AND rating >= %d AND rating <= %d ORDER BY ABS(rating - %d) LIMIT 1"
            % (user_id.replace("'", "''"), time_control.replace("'", "''"), rating_min, rating_max, user_rating)
        )
    match = cur.fetchone()

    if match:
        matched_uid, matched_name, matched_avatar, matched_rating, matched_tc = match

        cur.execute("DELETE FROM matchmaking_queue WHERE user_id IN ('%s', '%s')" % (
            user_id.replace("'", "''"), matched_uid.replace("'", "''")))

        assign_white = random.random() < 0.5
        initial_time = get_initial_time(time_control)

        if assign_white:
            w_uid, w_name, w_avatar, w_rating = user_id, username, avatar, user_rating
            b_uid, b_name, b_avatar, b_rating = matched_uid, matched_name, matched_avatar or '', matched_rating
        else:
            w_uid, w_name, w_avatar, w_rating = matched_uid, matched_name, matched_avatar or '', matched_rating
            b_uid, b_name, b_avatar, b_rating = user_id, username, avatar, user_rating

        cur.execute(
            """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating, black_user_id, black_username, black_avatar, black_rating, time_control, opponent_type, is_bot_game, white_time, black_time)
            VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', '%s', FALSE, %d, %d) RETURNING id"""
            % (w_uid.replace("'", "''"), w_name.replace("'", "''"), w_avatar.replace("'", "''"), w_rating,
               b_uid.replace("'", "''"), b_name.replace("'", "''"), b_avatar.replace("'", "''"), b_rating,
               time_control.replace("'", "''"), opponent_type.replace("'", "''"), initial_time, initial_time)
        )
        game_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        player_color = 'white' if assign_white else 'black'
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'status': 'matched',
            'game_id': game_id,
            'player_color': player_color,
            'opponent_name': matched_name,
            'opponent_rating': matched_rating,
            'opponent_avatar': matched_avatar or ''
        })}

    if not already_in:
        cur.execute(
            "INSERT INTO matchmaking_queue (user_id, username, avatar, rating, opponent_type, time_control) VALUES ('%s', '%s', '%s', %d, '%s', '%s') ON CONFLICT (user_id) DO UPDATE SET rating = %d, opponent_type = '%s', time_control = '%s', created_at = NOW()"
            % (user_id.replace("'", "''"), username.replace("'", "''"), avatar.replace("'", "''"), user_rating,
               opponent_type.replace("'", "''"), time_control.replace("'", "''"),
               user_rating, opponent_type.replace("'", "''"), time_control.replace("'", "''"))
        )
        conn.commit()

    cur.execute("SELECT COUNT(*) FROM matchmaking_queue WHERE time_control = '%s'" % time_control.replace("'", "''"))
    queue_count = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
        'status': 'searching',
        'queue_count': queue_count,
        'message': 'Ищем соперника с рейтингом %d-%d' % (rating_min, rating_max)
    })}