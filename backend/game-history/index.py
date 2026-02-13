import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение истории партий игрока и его профиля"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'GET':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id', '')

    if not user_id:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        "SELECT id, username, avatar, rating, games_played, wins, losses, draws FROM users WHERE id = '%s'"
        % user_id.replace("'", "''")
    )
    user_row = cur.fetchone()

    if not user_row:
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'user': None, 'games': []})}

    user = {
        'id': user_row[0],
        'username': user_row[1],
        'avatar': user_row[2],
        'rating': user_row[3],
        'games_played': user_row[4],
        'wins': user_row[5],
        'losses': user_row[6],
        'draws': user_row[7]
    }

    limit = int(params.get('limit', '50'))
    offset = int(params.get('offset', '0'))

    cur.execute(
        """SELECT id, opponent_name, opponent_type, opponent_rating, result, user_color, time_control, difficulty, 
           moves_count, move_history, rating_before, rating_after, rating_change, duration_seconds, end_reason, created_at
        FROM game_history WHERE user_id = '%s' ORDER BY created_at DESC LIMIT %d OFFSET %d"""
        % (user_id.replace("'", "''"), limit, offset)
    )
    rows = cur.fetchall()

    games = []
    for r in rows:
        games.append({
            'id': r[0],
            'opponent_name': r[1],
            'opponent_type': r[2],
            'opponent_rating': r[3],
            'result': r[4],
            'user_color': r[5],
            'time_control': r[6],
            'difficulty': r[7],
            'moves_count': r[8],
            'move_history': r[9],
            'rating_before': r[10],
            'rating_after': r[11],
            'rating_change': r[12],
            'duration_seconds': r[13],
            'end_reason': r[14],
            'created_at': r[15].isoformat() if r[15] else None
        })

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'user': user, 'games': games}, ensure_ascii=False)
    }
