import json
import os
import psycopg2
import random
import string


def esc(val):
    return str(val).replace("'", "''")


def generate_code():
    chars = string.ascii_uppercase + string.digits
    return 'USER-' + ''.join(random.choices(chars, k=7))


def handler(event: dict, context) -> dict:
    """Управление друзьями: добавление, удаление, список, профиль друга, история игр друга"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        action = qs.get('action', 'list')
        user_id = qs.get('user_id', '')

        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        if action == 'my_code':
            cur.execute("SELECT user_code FROM users WHERE id = '%s'" % esc(user_id))
            row = cur.fetchone()
            if not row or not row[0]:
                new_code = generate_code()
                for _ in range(10):
                    cur.execute("SELECT id FROM users WHERE user_code = '%s'" % esc(new_code))
                    if not cur.fetchone():
                        break
                    new_code = generate_code()
                cur.execute("UPDATE users SET user_code = '%s' WHERE id = '%s'" % (esc(new_code), esc(user_id)))
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'code': new_code})}
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'code': row[0]})}

        if action == 'heartbeat':
            cur.execute("UPDATE users SET last_online = NOW() WHERE id = '%s'" % esc(user_id))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        if action == 'resolve_code':
            code = qs.get('code', '')
            if not code:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'code required'})}
            cur.execute("SELECT id, username, avatar, rating, city, user_code FROM users WHERE user_code = '%s'" % esc(code))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'user': {
                    'id': row[0], 'username': row[1], 'avatar': row[2] or '',
                    'rating': row[3], 'city': row[4] or '', 'user_code': row[5]
                }
            })}

        if action == 'profile':
            friend_id = qs.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute(
                "SELECT id, username, avatar, rating, city, games_played, wins, losses, draws, last_online FROM users WHERE id = '%s'" % esc(friend_id)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'user': {
                    'id': row[0], 'username': row[1], 'avatar': row[2] or '',
                    'rating': row[3], 'city': row[4] or '',
                    'games_played': row[5], 'wins': row[6], 'losses': row[7], 'draws': row[8],
                    'last_online': row[9].isoformat() if row[9] else None
                }
            })}

        if action == 'friend_games':
            friend_id = qs.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute(
                """SELECT id, opponent_name, opponent_type, opponent_rating, result, user_color,
                          time_control, difficulty, moves_count, rating_before, rating_after,
                          rating_change, duration_seconds, end_reason, created_at
                   FROM game_history WHERE user_id = '%s' ORDER BY created_at DESC LIMIT 50""" % esc(friend_id)
            )
            rows = cur.fetchall()
            cur.close()
            conn.close()
            games = []
            for r in rows:
                games.append({
                    'id': r[0], 'opponent_name': r[1], 'opponent_type': r[2],
                    'opponent_rating': r[3], 'result': r[4], 'user_color': r[5],
                    'time_control': r[6], 'difficulty': r[7], 'moves_count': r[8],
                    'rating_before': r[9], 'rating_after': r[10], 'rating_change': r[11],
                    'duration_seconds': r[12], 'end_reason': r[13],
                    'created_at': r[14].isoformat() if r[14] else None
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'games': games})}

        cur.execute(
            """SELECT u.id, u.username, u.avatar, u.rating, u.city, u.last_online, u.user_code
               FROM friends f
               JOIN users u ON u.id = f.friend_id
               WHERE f.user_id = '%s'
               ORDER BY u.last_online DESC NULLS LAST""" % esc(user_id)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        friends = []
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        for r in rows:
            last_online = r[5]
            is_online = False
            if last_online:
                is_online = (now - last_online) < timedelta(minutes=5)
            friends.append({
                'id': r[0], 'username': r[1], 'avatar': r[2] or '',
                'rating': r[3], 'city': r[4] or '',
                'status': 'online' if is_online else 'offline',
                'user_code': r[6] or ''
            })
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'friends': friends})}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'add')
        user_id = body.get('user_id', '')

        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        if action == 'add':
            friend_code = body.get('friend_code', '')
            if not friend_code:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_code required'})}

            cur.execute("SELECT id, username, avatar, rating, city, user_code FROM users WHERE user_code = '%s'" % esc(friend_code))
            friend_row = cur.fetchone()
            if not friend_row:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}

            friend_id = friend_row[0]
            if friend_id == user_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Cannot add yourself'})}

            cur.execute("SELECT id FROM friends WHERE user_id = '%s' AND friend_id = '%s'" % (esc(user_id), esc(friend_id)))
            if cur.fetchone():
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Already friends'})}

            cur.execute("INSERT INTO friends (user_id, friend_id) VALUES ('%s', '%s')" % (esc(user_id), esc(friend_id)))
            cur.execute("INSERT INTO friends (user_id, friend_id) VALUES ('%s', '%s') ON CONFLICT DO NOTHING" % (esc(friend_id), esc(user_id)))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'status': 'added',
                'friend': {
                    'id': friend_row[0], 'username': friend_row[1], 'avatar': friend_row[2] or '',
                    'rating': friend_row[3], 'city': friend_row[4] or '', 'user_code': friend_row[5]
                }
            })}

        if action == 'remove':
            friend_id = body.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute("DELETE FROM friends WHERE user_id = '%s' AND friend_id = '%s'" % (esc(user_id), esc(friend_id)))
            cur.execute("DELETE FROM friends WHERE user_id = '%s' AND friend_id = '%s'" % (esc(friend_id), esc(user_id)))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'removed'})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
