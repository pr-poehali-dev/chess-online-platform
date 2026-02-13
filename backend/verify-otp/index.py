import json
import os
import hashlib
from datetime import datetime
import psycopg2


def handler(event, context):
    """Проверка OTP-кода и регистрация/авторизация пользователя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if isinstance(raw_body, str) and raw_body.strip() else {}
    email = body.get('email', '').strip().lower()
    code = body.get('code', '').strip()
    name = body.get('name', '').strip()
    city = body.get('city', '').strip()
    mode = body.get('mode', 'register')

    if not email or not code:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Email and code required'})}

    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    cur.execute(
        "SELECT id, code FROM {schema}.otp_codes WHERE email = '{email}' AND used = false AND expires_at > '{now}' ORDER BY created_at DESC LIMIT 1".format(
            schema=schema, email=email.replace("'", "''"), now=now_str
        )
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Code expired or not found'})}

    otp_id, stored_code = row

    if stored_code != code:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid code'})}

    cur.execute(
        "UPDATE {schema}.otp_codes SET used = true WHERE id = {otp_id}".format(
            schema=schema, otp_id=otp_id
        )
    )

    user_id = 'u_' + email.replace("'", "''")

    cur.execute(
        "SELECT id, username, rating, city, games_played, wins, losses, draws FROM {schema}.users WHERE id = '{uid}'".format(
            schema=schema, uid=user_id.replace("'", "''")
        )
    )
    existing = cur.fetchone()

    if mode == 'admin':
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'verified': True})
        }

    if mode == 'login':
        if not existing:
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found', 'message': 'Аккаунт с этим email не найден. Пожалуйста, зарегистрируйтесь.'})}

        conn.commit()
        user_data = {
            'id': existing[0],
            'username': existing[1],
            'rating': existing[2],
            'city': existing[3],
            'games_played': existing[4],
            'wins': existing[5],
            'losses': existing[6],
            'draws': existing[7],
            'is_new': False
        }
    elif existing:
        if name:
            cur.execute(
                "UPDATE {schema}.users SET username = '{name}', updated_at = now() WHERE id = '{uid}'".format(
                    schema=schema, name=name.replace("'", "''"), uid=user_id.replace("'", "''")
                )
            )
            if city:
                cur.execute(
                    "UPDATE {schema}.users SET city = '{city}' WHERE id = '{uid}'".format(
                        schema=schema, city=city.replace("'", "''"), uid=user_id.replace("'", "''")
                    )
                )
        conn.commit()

        user_data = {
            'id': existing[0],
            'username': name if name else existing[1],
            'rating': existing[2],
            'city': city if city else existing[3],
            'games_played': existing[4],
            'wins': existing[5],
            'losses': existing[6],
            'draws': existing[7],
            'is_new': False
        }
    else:
        if not name:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Name required for new user'})}

        cur.execute(
            "INSERT INTO {schema}.users (id, username, email, city, rating, games_played, wins, losses, draws) VALUES ('{uid}', '{name}', '{email}', '{city}', 500, 0, 0, 0, 0)".format(
                schema=schema,
                uid=user_id.replace("'", "''"),
                name=name.replace("'", "''"),
                email=email.replace("'", "''"),
                city=city.replace("'", "''")
            )
        )
        conn.commit()

        user_data = {
            'id': user_id,
            'username': name,
            'rating': 500,
            'city': city,
            'games_played': 0,
            'wins': 0,
            'losses': 0,
            'draws': 0,
            'is_new': True
        }

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'user': user_data})
    }