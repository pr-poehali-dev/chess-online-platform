import json
import os
import psycopg2
import time as time_module
import random
import chess

BASE_CDN = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files'
BOTS = [
    {'id': 'bot_anna',      'strength': 810},
    {'id': 'bot_artem',     'strength': 840},
    {'id': 'bot_daria',     'strength': 890},
    {'id': 'bot_timur',     'strength': 930},
    {'id': 'bot_sofia',     'strength': 980},
    {'id': 'bot_roman',     'strength': 1010},
    {'id': 'bot_marina',    'strength': 1060},
    {'id': 'bot_kostya',    'strength': 1090},
    {'id': 'bot_olga',      'strength': 1120},
    {'id': 'bot_alexey',    'strength': 1150},
    {'id': 'bot_irina',     'strength': 1180},
    {'id': 'bot_pavel',     'strength': 1210},
    {'id': 'bot_elena',     'strength': 1240},
    {'id': 'bot_dmitry',    'strength': 1270},
    {'id': 'bot_yulia',     'strength': 1310},
    {'id': 'bot_oleg',      'strength': 1350},
    {'id': 'bot_tatiana',   'strength': 1390},
    {'id': 'bot_andrey',    'strength': 1420},
    {'id': 'bot_nastya',    'strength': 1460},
    {'id': 'bot_igor',      'strength': 1500},
    {'id': 'bot_vera',      'strength': 1540},
    {'id': 'bot_sergey',    'strength': 1580},
    {'id': 'bot_natalia',   'strength': 1640},
    {'id': 'bot_vladimir',  'strength': 1700},
    {'id': 'bot_ekaterina', 'strength': 1750},
    {'id': 'bot_nikolay',   'strength': 1800},
    {'id': 'bot_svetlana',  'strength': 1870},
    {'id': 'bot_maxim',     'strength': 1940},
    {'id': 'bot_anastasia', 'strength': 2030},
    {'id': 'bot_viktor',    'strength': 2120},
    {'id': 'bot_evgenia',   'strength': 2250},
]


def moves_to_board(move_history_str: str) -> chess.Board:
    """Воссоздаём шахматную доску из истории ходов в формате 'e2-e4,e7-e5,...'"""
    board = chess.Board()
    if not move_history_str:
        return board
    for notation in move_history_str.split(','):
        notation = notation.strip()
        if not notation:
            continue
        parts = notation.split('-')
        if len(parts) != 2:
            continue
        uci = parts[0] + parts[1]
        try:
            move = chess.Move.from_uci(uci)
            if move in board.legal_moves:
                board.push(move)
        except Exception:
            continue
    return board


def choose_bot_move(board: chess.Board, bot_rating: int) -> chess.Move | None:
    """Выбираем ход бота: чем выше рейтинг — тем глубже поиск"""
    legal = list(board.legal_moves)
    if not legal:
        return None

    if bot_rating < 1000:
        # Почти случайный ход
        return random.choice(legal)

    if bot_rating < 1400:
        # Жадный ход: берём фигуру если можем, иначе случайно
        captures = [m for m in legal if board.is_capture(m)]
        if captures and random.random() < 0.7:
            return random.choice(captures)
        return random.choice(legal)

    if bot_rating < 1800:
        # Простой минимакс глубина 2
        best_move = None
        best_score = -99999
        for move in legal:
            board.push(move)
            score = _material_score(board, not board.turn)
            board.pop()
            if score > best_score or best_move is None:
                best_score = score
                best_move = move
        return best_move

    # Высокий рейтинг: минимакс глубина 3 с alpha-beta
    move, _ = _minimax(board, 3, -99999, 99999, True)
    return move if move else random.choice(legal)


def _material_score(board: chess.Board, color: chess.Color) -> int:
    values = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
              chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}
    score = 0
    for piece_type, val in values.items():
        score += len(board.pieces(piece_type, color)) * val
        score -= len(board.pieces(piece_type, not color)) * val
    return score


def _minimax(board: chess.Board, depth: int, alpha: int, beta: int, maximizing: bool):
    if depth == 0 or board.is_game_over():
        return None, _material_score(board, chess.WHITE if maximizing else chess.BLACK)

    best_move = None
    if maximizing:
        best_val = -99999
        for move in board.legal_moves:
            board.push(move)
            _, val = _minimax(board, depth - 1, alpha, beta, False)
            board.pop()
            if val > best_val:
                best_val = val
                best_move = move
            alpha = max(alpha, val)
            if beta <= alpha:
                break
        return best_move, best_val
    else:
        best_val = 99999
        for move in board.legal_moves:
            board.push(move)
            _, val = _minimax(board, depth - 1, alpha, beta, True)
            board.pop()
            if val < best_val:
                best_val = val
                best_move = move
            beta = min(beta, val)
            if beta <= alpha:
                break
        return best_move, best_val


def _can_improve_in_n_moves(board: chess.Board, bot_color: chess.Color, depth: int) -> bool:
    """Проверяем, есть ли хоть один путь за depth ходов, улучшающий позицию бота."""
    if depth == 0:
        return False
    if board.turn != bot_color:
        # Ход соперника — рекурсия: нам нужно чтобы хотя бы один его ход НЕ улучшал его позицию
        for move in list(board.legal_moves)[:20]:
            board.push(move)
            result = _can_improve_in_n_moves(board, bot_color, depth - 1)
            board.pop()
            if result:
                return True
        return False
    for move in list(board.legal_moves)[:20]:
        board.push(move)
        # Проверяем мат/выигрыш бота
        if board.is_checkmate() and board.turn != bot_color:
            board.pop()
            return True
        board.pop()
    return False


def should_bot_resign(board: chess.Board, bot_color: chess.Color, move_number: int) -> bool:
    """Логика сдачи бота по трём условиям."""
    values = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9}
    bot_material = sum(len(board.pieces(pt, bot_color)) * v for pt, v in values.items())
    opp_material = sum(len(board.pieces(pt, not bot_color)) * v for pt, v in values.items())
    advantage = opp_material - bot_material

    # 1. Только король + явный перевес: проверяем 2 хода вперёд
    if bot_material == 0 and advantage >= 5:
        if not _can_improve_in_n_moves(board, bot_color, 2):
            return True

    # 2. Сильный перевес в конце партии: проверяем 5 ходов вперёд
    if advantage >= 15 and move_number >= 20:
        if not _can_improve_in_n_moves(board, bot_color, 5):
            return True

    # 3. Потеря ферзя в первых 15 ходах
    bot_queens = len(board.pieces(chess.QUEEN, bot_color))
    if bot_queens == 0 and move_number <= 30 and advantage >= 9:
        return True

    return False


def notation_from_uci(uci: str) -> str:
    """Конвертируем UCI 'e2e4' → наш формат 'e2-e4'"""
    return uci[:2] + '-' + uci[2:4]


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
    """Ходы и состояние онлайн-партии: отправка хода, получение состояния, завершение игры"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        if check_rate_limit(cur, conn, client_ip, 'online-move', 60, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        game_id = qs.get('game_id', '')
        if not game_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id required'})}

        # Быстрый режим — только сигналы, без состояния игры
        if qs.get('signals_only') == '1':
            req_user_id = qs.get('user_id', '')
            signals = []
            if req_user_id:
                safe_uid = req_user_id.replace("'", "''")
                cur.execute(
                    "SELECT id, from_user_id, signal_type, signal_data FROM webrtc_signals WHERE game_id = %d AND to_user_id = '%s' AND consumed = FALSE ORDER BY id ASC LIMIT 20"
                    % (int(game_id), safe_uid)
                )
                sig_rows = cur.fetchall()
                if sig_rows:
                    sig_ids = ','.join(str(r[0]) for r in sig_rows)
                    cur.execute("UPDATE webrtc_signals SET consumed = TRUE WHERE id IN (%s)" % sig_ids)
                    conn.commit()
                    signals = [{'from': r[1], 'type': r[2], 'data': r[3]} for r in sig_rows]
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'signals': signals})}

        cur.execute(
            """SELECT id, white_user_id, white_username, white_avatar, white_rating,
                      black_user_id, black_username, black_avatar, black_rating,
                      time_control, status, is_bot_game, current_player,
                      white_time, black_time, move_history, board_state,
                      winner, end_reason,
                      EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move,
                      move_number,
                      rematch_offered_by, rematch_status, rematch_game_id,
                      draw_offered_by
            FROM online_games WHERE id = %d""" % int(game_id)
        )
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

        seconds_since_move = row[19] or 0
        status = row[10]
        current_player = row[12]
        white_time = row[13]
        black_time = row[14]
        move_number = row[20] or 0

        if status == 'playing' and seconds_since_move > 0:
            if current_player == 'white':
                white_time = max(0, white_time - seconds_since_move)
            else:
                black_time = max(0, black_time - seconds_since_move)

        signals = []
        req_user_id = qs.get('user_id', '')
        if req_user_id:
            safe_uid = req_user_id.replace("'", "''")
            cur.execute(
                "SELECT id, from_user_id, signal_type, signal_data FROM webrtc_signals WHERE game_id = %d AND to_user_id = '%s' AND consumed = FALSE ORDER BY id ASC LIMIT 20"
                % (int(game_id), safe_uid)
            )
            sig_rows = cur.fetchall()
            if sig_rows:
                sig_ids = ','.join(str(r[0]) for r in sig_rows)
                cur.execute("UPDATE webrtc_signals SET consumed = TRUE WHERE id IN (%s)" % sig_ids)
                conn.commit()
                signals = [{'from': r[1], 'type': r[2], 'data': r[3]} for r in sig_rows]

        cur.close()
        conn.close()

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
                'move_number': move_number,
                'seconds_since_move': seconds_since_move,
                'rematch_offered_by': row[21], 'rematch_status': row[22], 'rematch_game_id': row[23],
                'draw_offered_by': row[24]
            },
            'signals': signals
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
                  move_number, white_rating, black_rating
        FROM online_games WHERE id = %d""" % int(game_id)
    )
    game = cur.fetchone()

    if not game:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

    g_id, white_uid, black_uid, current_player, status, white_time, black_time, move_hist, is_bot, tc, secs_since, db_move_number, white_rating, black_rating = game
    db_move_number = db_move_number or 0

    if user_id != white_uid and user_id != black_uid:
        cur.close()
        conn.close()
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'not a player in this game'})}

    player_color = 'white' if user_id == white_uid else 'black'

    def esc(val):
        return str(val).replace("'", "''")

    if action == 'chat':
        text = body.get('text', '').strip()[:500]
        if not text:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'text required'})}
        to_user = black_uid if user_id == white_uid else white_uid
        import json as _json
        cur.execute(
            "INSERT INTO webrtc_signals (game_id, from_user_id, to_user_id, signal_type, signal_data) VALUES (%d, '%s', '%s', 'chat', '%s')"
            % (g_id, esc(user_id), esc(to_user), esc(_json.dumps({'text': text})))
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'sent'})}

    if action == 'reconnect':
        # Сбрасываем last_move_at только если сейчас ход соперника (не наш)
        # Это предотвращает срабатывание таймера бездействия у ожидающего
        if status == 'playing' and player_color != current_player:
            cur.execute("UPDATE online_games SET last_move_at = NOW() WHERE id = %d" % g_id)
            conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'ok'})}


    if action == 'signal':
        signal_type = body.get('signal_type', '')
        signal_data = body.get('signal_data', '')
        if not signal_type or not signal_data:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'signal_type and signal_data required'})}
        to_user = black_uid if user_id == white_uid else white_uid
        cur.execute(
            "INSERT INTO webrtc_signals (game_id, from_user_id, to_user_id, signal_type, signal_data) VALUES (%d, '%s', '%s', '%s', '%s')"
            % (g_id, esc(user_id), esc(to_user), esc(signal_type), esc(signal_data))
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'signal_sent'})}

    if action == 'rematch_offer':
        cur.execute(
            "UPDATE online_games SET rematch_offered_by = '%s', rematch_status = 'pending', rematch_offered_at = NOW(), updated_at = NOW() WHERE id = %d"
            % (esc(user_id), g_id)
        )
        conn.commit()

        # Если игра с ботом — бот сам решает принять или отклонить с задержкой
        if is_bot:
            cur.close()
            conn.close()
            time_module.sleep(random.randint(3, 7))
            accepts = random.random() < 0.5

            conn3 = psycopg2.connect(os.environ['DATABASE_URL'])
            cur3 = conn3.cursor()
            if accepts:
                # Создаём новую партию (цвета меняются)
                cur3.execute(
                    """SELECT white_user_id, white_username, white_avatar, white_rating,
                              black_user_id, black_username, black_avatar, black_rating,
                              time_control, opponent_type, is_bot_game
                    FROM online_games WHERE id = %d""" % g_id
                )
                old = cur3.fetchone()
                if old:
                    ow_uid, ow_name, ow_avatar, ow_rating = old[0], old[1], old[2] or '', old[3]
                    ob_uid, ob_name, ob_avatar, ob_rating = old[4], old[5], old[6] or '', old[7]
                    otc, oop, o_is_bot = old[8], old[9], old[10]

                    def _get_init_time(tc):
                        if '+' in tc:
                            return int(tc.split('+')[0]) * 60
                        return {'blitz': 180, 'rapid': 600, 'classic': 900}.get(tc, 600)

                    init_time = _get_init_time(otc)
                    cur3.execute(
                        """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating,
                            black_user_id, black_username, black_avatar, black_rating,
                            time_control, opponent_type, is_bot_game, white_time, black_time)
                        VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', '%s', %s, %d, %d) RETURNING id"""
                        % (esc(ob_uid), esc(ob_name), esc(ob_avatar), ob_rating,
                           esc(ow_uid), esc(ow_name), esc(ow_avatar), ow_rating,
                           esc(otc), esc(oop), 'TRUE' if o_is_bot else 'FALSE', init_time, init_time)
                    )
                    new_game_id = cur3.fetchone()[0]
                    cur3.execute(
                        "UPDATE online_games SET rematch_status = 'accepted', rematch_game_id = %d, updated_at = NOW() WHERE id = %d"
                        % (new_game_id, g_id)
                    )
                    conn3.commit()
            else:
                cur3.execute(
                    "UPDATE online_games SET rematch_status = 'declined', updated_at = NOW() WHERE id = %d" % g_id
                )
                conn3.commit()
            cur3.close()
            conn3.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_offered'})}

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_offered'})}

    if action in ('rematch_decline', 'rematch_expired'):
        new_rs = 'expired' if action == 'rematch_expired' else 'declined'
        cur.execute(
            "UPDATE online_games SET rematch_status = '%s', updated_at = NOW() WHERE id = %d" % (new_rs, g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_' + new_rs})}

    if action == 'rematch_accept':
        cur.execute(
            """SELECT white_user_id, white_username, white_avatar, white_rating,
                      black_user_id, black_username, black_avatar, black_rating,
                      time_control, opponent_type
            FROM online_games WHERE id = %d""" % g_id
        )
        old = cur.fetchone()
        if not old:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

        ow_uid, ow_name, ow_avatar, ow_rating = old[0], old[1], old[2] or '', old[3]
        ob_uid, ob_name, ob_avatar, ob_rating = old[4], old[5], old[6] or '', old[7]
        otc, oop = old[8], old[9]

        def get_initial_time(tc):
            if '+' in tc:
                return int(tc.split('+')[0]) * 60
            return {'blitz': 180, 'rapid': 600, 'classic': 900}.get(tc, 600)

        init_time = get_initial_time(otc)

        cur.execute(
            """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating,
                black_user_id, black_username, black_avatar, black_rating,
                time_control, opponent_type, is_bot_game, white_time, black_time)
            VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', '%s', FALSE, %d, %d) RETURNING id"""
            % (esc(ob_uid), esc(ob_name), esc(ob_avatar), ob_rating,
               esc(ow_uid), esc(ow_name), esc(ow_avatar), ow_rating,
               esc(otc), esc(oop), init_time, init_time)
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
            'old_white': ow_uid,
            'old_black': ob_uid
        })}

    if action == 'draw_offer':
        cur.execute(
            "UPDATE online_games SET draw_offered_by = '%s', updated_at = NOW() WHERE id = %d AND status = 'playing'"
            % (user_id.replace("'", "''"), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'draw_offered'})}

    if action == 'draw_decline':
        cur.execute(
            "UPDATE online_games SET draw_offered_by = NULL, updated_at = NOW() WHERE id = %d" % g_id
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'draw_declined'})}

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
            "UPDATE online_games SET status = 'finished', end_reason = 'draw', draw_offered_by = NULL, updated_at = NOW() WHERE id = %d" % g_id
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
    client_move_number = body.get('move_number', -1)

    if not move:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'move required'})}

    if client_move_number >= 0 and client_move_number != db_move_number:
        cur.close()
        conn.close()
        return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'move_number mismatch', 'expected': db_move_number, 'got': client_move_number})}

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
    new_move_number = db_move_number + 1

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
            move_number = %d,
            last_move_at = NOW(),
            updated_at = NOW()
        WHERE id = %d AND move_number = %d"""
        % (next_player, new_white_time, new_black_time,
           new_move_hist.replace("'", "''"),
           board_state.replace("'", "''") if board_state else 'initial',
           new_status, winner_val, end_reason_val, new_move_number, g_id, db_move_number)
    )

    rows_updated = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    if rows_updated == 0:
        return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'concurrent move detected, retry'})}

    # Если игра с ботом и она ещё идёт — бот делает свой ход с задержкой
    if is_bot and new_status == 'playing':
        player_is_white = (user_id == white_uid)
        bot_is_white = not player_is_white
        # Рейтинг бота в БД = 500, но для уровня движка используем strength
        # Определяем strength по id бота (white/black uid начинается с bot_)
        bot_uid = white_uid if bot_is_white else black_uid
        bot_strength = next((b['strength'] for b in BOTS if b['id'] == bot_uid), 1200)

        # Восстанавливаем доску — нужна ДО задержки, чтобы проверить сдачу
        board = moves_to_board(new_move_hist)
        bot_chess_color = chess.WHITE if bot_is_white else chess.BLACK

        conn2 = psycopg2.connect(os.environ['DATABASE_URL'])
        cur2 = conn2.cursor()

        # Проверяем: должен ли бот сдаться
        if board.turn == bot_chess_color and should_bot_resign(board, bot_chess_color, new_move_number):
            # Бот «думает» перед сдачей — 3-5 секунд
            time_module.sleep(random.randint(3, 5))
            player_uid = black_uid if bot_is_white else white_uid
            cur2.execute(
                "UPDATE online_games SET status = 'finished', winner = '%s', end_reason = 'resign', updated_at = NOW() WHERE id = %d"
                % (player_uid.replace("'", "''"), g_id)
            )
            conn2.commit()
            cur2.close()
            conn2.close()
        else:
            # Задержка от 1 до 20 секунд — варьируется по силе бота
            if bot_strength >= 1800:
                delay = random.randint(4, 18)
            elif bot_strength >= 1400:
                delay = random.randint(2, 14)
            else:
                delay = random.randint(1, 10)
            delay = min(20, max(1, delay + random.randint(-2, 3)))
            time_module.sleep(delay)

            # Вычисляем ход бота
            if board.turn == bot_chess_color:
                bot_move = choose_bot_move(board, bot_strength)
                if bot_move:
                    bot_notation = notation_from_uci(bot_move.uci())

                    # Применяем ход бота на доске для проверки статуса
                    board.push(bot_move)
                    bot_game_over = board.is_game_over()
                    bot_is_checkmate = board.is_checkmate()
                    bot_is_stalemate = board.is_stalemate()

                    bot_move_hist = new_move_hist + ',' + bot_notation
                    bot_next_player = 'black' if bot_is_white else 'white'

                    bot_status = 'playing'
                    bot_winner = 'NULL'
                    bot_end_reason = 'NULL'
                    if bot_game_over:
                        bot_status = 'finished'
                        if bot_is_checkmate:
                            winner_uid = white_uid if bot_is_white else black_uid
                            bot_winner = "'%s'" % winner_uid.replace("'", "''")
                            bot_end_reason = "'checkmate'"
                        elif bot_is_stalemate:
                            bot_end_reason = "'stalemate'"
                        else:
                            bot_end_reason = "'draw'"

                    cur2.execute(
                        """UPDATE online_games SET
                            current_player = '%s',
                            move_history = '%s',
                            status = '%s',
                            winner = %s,
                            end_reason = %s,
                            move_number = %d,
                            last_move_at = NOW(),
                            updated_at = NOW()
                        WHERE id = %d AND move_number = %d"""
                        % (bot_next_player,
                           bot_move_hist.replace("'", "''"),
                           bot_status, bot_winner, bot_end_reason,
                           new_move_number + 1, g_id, new_move_number)
                    )
                    conn2.commit()
            cur2.close()
            conn2.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
        'status': new_status,
        'current_player': next_player,
        'move_number': new_move_number,
        'white_time': new_white_time,
        'black_time': new_black_time
    })}