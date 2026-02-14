import json
import os
import psycopg2
import random


def esc(val):
    return str(val).replace("'", "''")


def get_initial_time(time_control):
    if '+' in time_control:
        parts = time_control.split('+')
        return int(parts[0]) * 60
    mapping = {'blitz': 180, 'rapid': 600, 'classic': 900}
    return mapping.get(time_control, 600)


def handler(event: dict, context) -> dict:
    """Ходы и состояние онлайн-партии: отправка хода, получение состояния, реванш"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        game_id = qs.get('game_id', '')
        if not game_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id required'})}

        cur.execute(
            """SELECT id, white_user_id, white_username, white_avatar, white_rating,
                      black_user_id, black_username, black_avatar, black_rating,
                      time_control, status, is_bot_game, current_player,
                      white_time, black_time, move_history, board_state,
                      winner, end_reason,
                      EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move,
                      rematch_offered_by, rematch_status, rematch_game_id
            FROM online_games WHERE id = %d""" % int(game_id)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

        seconds_since_move = row[19] or 0
        status = row[10]
        current_player = row[12]
        white_time = row[13]
        black_time = row[14]

        if status == 'playing' and seconds_since_move > 0:
            if current_player == 'white':
                white_time = max(0, white_time - seconds_since_move)
            else:
                black_time = max(0, black_time - seconds_since_move)

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'game': {
                'id': row[0],
                'white_user_id': row[1], 'white_username': row[2], 'white_avatar': row[3], 'white_rating': row[4],
                'black_user_id': row[5], 'black_username': row[6], 'black_avatar': row[7], 'black_rating': row[8],
                'time_control': row[9], 'status': status, 'is_bot_game': row[11],
                'current_player': current_player,
                'white_time': white_time, 'black_time': black_time,
                'move_history': row[15], 'board_state': row[16],
                'winner': row[17], 'end_reason': row[18],
                'rematch_offered_by': row[20],
                'rematch_status': row[21],
                'rematch_game_id': row[22]
            }
        })}

    if event.get('httpMethod') != 'POST':
        cur.close()
        conn.close()
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    action = body.get('action', 'move')
    game_id = body.get('game_id')
    user_id = body.get('user_id', '')

    if not game_id or not user_id:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id and user_id required'})}

    cur.execute(
        """SELECT id, white_user_id, black_user_id, current_player, status,
                  white_time, black_time, move_history, is_bot_game, time_control,
                  EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move,
                  rematch_offered_by, rematch_status,
                  white_username, white_avatar, white_rating,
                  black_username, black_avatar, black_rating
        FROM online_games WHERE id = %d""" % int(game_id)
    )
    game = cur.fetchone()

    if not game:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

    g_id = game[0]
    white_uid = game[1]
    black_uid = game[2]
    current_player = game[3]
    status = game[4]
    white_time = game[5]
    black_time = game[6]
    move_hist = game[7]
    is_bot = game[8]
    tc = game[9]
    secs_since = game[10]
    rematch_offered_by = game[11]
    rematch_status = game[12]
    w_name = game[13]
    w_avatar = game[14]
    w_rating = game[15]
    b_name = game[16]
    b_avatar = game[17]
    b_rating = game[18]

    if user_id != white_uid and user_id != black_uid:
        cur.close()
        conn.close()
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'not a player in this game'})}

    player_color = 'white' if user_id == white_uid else 'black'

    if action == 'offer_rematch':
        if rematch_offered_by and rematch_offered_by == user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'you already offered rematch'})}

        cur.execute(
            "UPDATE online_games SET rematch_offered_by = '%s', rematch_status = 'pending', updated_at = NOW() WHERE id = %d"
            % (esc(user_id), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_offered'})}

    if action == 'accept_rematch':
        if not rematch_offered_by or rematch_offered_by == user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'no rematch to accept'})}

        initial_time = get_initial_time(tc)
        new_w_uid, new_w_name, new_w_avatar, new_w_rating = black_uid, b_name, b_avatar, b_rating
        new_b_uid, new_b_name, new_b_avatar, new_b_rating = white_uid, w_name, w_avatar, w_rating

        cur.execute(
            """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating,
                black_user_id, black_username, black_avatar, black_rating,
                time_control, opponent_type, is_bot_game, white_time, black_time)
            VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', 'rematch', FALSE, %d, %d) RETURNING id"""
            % (esc(new_w_uid), esc(new_w_name), esc(new_w_avatar or ''), new_w_rating,
               esc(new_b_uid), esc(new_b_name), esc(new_b_avatar or ''), new_b_rating,
               esc(tc), initial_time, initial_time)
        )
        new_game_id = cur.fetchone()[0]

        cur.execute(
            "UPDATE online_games SET rematch_status = 'accepted', rematch_game_id = %d, updated_at = NOW() WHERE id = %d"
            % (new_game_id, g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'status': 'rematch_accepted',
            'new_game_id': new_game_id,
            'player_color': 'white' if user_id == new_w_uid else 'black'
        })}

    if action == 'decline_rematch':
        cur.execute(
            "UPDATE online_games SET rematch_status = 'declined', updated_at = NOW() WHERE id = %d" % g_id
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_declined'})}

    if action == 'resign':
        winner = black_uid if player_color == 'white' else white_uid
        cur.execute(
            "UPDATE online_games SET status = 'finished', winner = '%s', end_reason = 'resign', updated_at = NOW() WHERE id = %d"
            % (esc(winner), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'finished', 'winner': winner, 'end_reason': 'resign'})}

    if action == 'draw':
        cur.execute(
            "UPDATE online_games SET status = 'finished', end_reason = 'draw', updated_at = NOW() WHERE id = %d" % g_id
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'finished', 'end_reason': 'draw'})}

    if action == 'timeout':
        loser_color = body.get('loser_color', '')
        winner = white_uid if loser_color == 'black' else black_uid
        cur.execute(
            "UPDATE online_games SET status = 'finished', winner = '%s', end_reason = 'timeout', updated_at = NOW() WHERE id = %d"
            % (esc(winner), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'finished', 'winner': winner, 'end_reason': 'timeout'})}

    if status != 'playing':
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game is not active'})}

    if player_color != current_player:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'not your turn'})}

    move = body.get('move', '')
    board_state = body.get('board_state', '')
    game_status = body.get('game_status', 'playing')
    winner_id = body.get('winner_id', '')

    if not move:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'move required'})}

    increment = 0
    if '+' in tc:
        parts = tc.split('+')
        increment = int(parts[1]) if len(parts) > 1 else 0
    elif tc == 'blitz':
        increment = 2
    elif tc == 'rapid':
        increment = 5
    elif tc == 'classic':
        increment = 10

    elapsed = secs_since if secs_since and secs_since > 0 else 0

    if current_player == 'white':
        white_time = max(0, white_time - elapsed + increment)
        new_white_time = white_time
        new_black_time = black_time
    else:
        black_time = max(0, black_time - elapsed + increment)
        new_white_time = white_time
        new_black_time = black_time

    new_move_hist = (move_hist + ',' + move) if move_hist else move
    next_player = 'black' if current_player == 'white' else 'white'

    new_status = 'playing'
    winner_val = 'NULL'
    end_reason_val = 'NULL'

    if game_status in ('checkmate', 'stalemate', 'finished'):
        new_status = 'finished'
        if game_status == 'checkmate' and winner_id:
            winner_val = "'%s'" % esc(winner_id)
            end_reason_val = "'checkmate'"
        elif game_status == 'stalemate':
            end_reason_val = "'stalemate'"
        else:
            end_reason_val = "'%s'" % esc(game_status)

    cur.execute(
        """UPDATE online_games SET
            current_player = '%s',
            white_time = %d,
            black_time = %d,
            move_history = '%s',
            board_state = '%s',
            status = '%s',
            winner = %s,
            end_reason = %s,
            last_move_at = NOW(),
            updated_at = NOW()
        WHERE id = %d"""
        % (next_player, new_white_time, new_black_time,
           esc(new_move_hist),
           esc(board_state) if board_state else 'initial',
           new_status, winner_val, end_reason_val, g_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
        'status': new_status,
        'current_player': next_player,
        'white_time': new_white_time,
        'black_time': new_black_time,
        'move_count': len(new_move_hist.split(',')) if new_move_hist else 0
    })}
