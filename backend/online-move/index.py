import json
import os
import psycopg2
import time as time_module

def handler(event: dict, context) -> dict:
    """Ходы и состояние онлайн-партии: отправка хода, получение состояния, завершение игры"""
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
                      EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move
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
                'winner': row[17], 'end_reason': row[18]
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
                  EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move
        FROM online_games WHERE id = %d""" % int(game_id)
    )
    game = cur.fetchone()

    if not game:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

    g_id, white_uid, black_uid, current_player, status, white_time, black_time, move_hist, is_bot, tc, secs_since = game

    if user_id != white_uid and user_id != black_uid:
        cur.close()
        conn.close()
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'not a player in this game'})}

    player_color = 'white' if user_id == white_uid else 'black'

    if action == 'resign':
        winner = black_uid if player_color == 'white' else white_uid
        cur.execute(
            "UPDATE online_games SET status = 'finished', winner = '%s', end_reason = 'resign', updated_at = NOW() WHERE id = %d"
            % (winner.replace("'", "''"), g_id)
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
            % (winner.replace("'", "''"), g_id)
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
            winner_val = "'%s'" % winner_id.replace("'", "''")
            end_reason_val = "'checkmate'"
        elif game_status == 'stalemate':
            end_reason_val = "'stalemate'"
        else:
            end_reason_val = "'%s'" % game_status.replace("'", "''")

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
           new_move_hist.replace("'", "''"),
           board_state.replace("'", "''") if board_state else 'initial',
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
        'move_history': new_move_hist
    })}
