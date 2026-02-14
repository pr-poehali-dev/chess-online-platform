import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Проверка существования пользователя в БД и очистка всех данных"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        user_id = qs.get('user_id', '')
        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        safe_id = user_id.replace("'", "''")
        cur.execute("SELECT id, username, rating, city FROM users WHERE id = '%s'" % safe_id)
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'exists': False})}
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'exists': True, 'user': {'id': row[0], 'username': row[1], 'rating': row[2], 'city': row[3]}})}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', '')

        if action == 'cleanup' and body.get('confirm') == 'DELETE_ALL':
            cur.execute("DELETE FROM friends")
            cur.execute("DELETE FROM game_history")
            cur.execute("DELETE FROM matchmaking_queue")
            cur.execute("DELETE FROM online_games")
            cur.execute("DELETE FROM otp_codes")
            cur.execute("DELETE FROM users")
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'cleaned', 'message': 'All user data deleted'})}

        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid action'})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
