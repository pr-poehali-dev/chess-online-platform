import json
import os
import psycopg2


def esc(val):
    return str(val).replace("'", "''")


def handler(event: dict, context) -> dict:
    """Управление ботами: получение списка и обновление данных (имя, аватар, рейтинг, сложность)"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod', 'GET')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if method == 'GET':
        cur.execute("SELECT id, name, avatar, rating, strength, difficulty, city, region FROM bots ORDER BY strength ASC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        bots = [
            {'id': r[0], 'name': r[1], 'avatar': r[2], 'rating': r[3], 'strength': r[4], 'difficulty': r[5], 'city': r[6] or 'Москва', 'region': r[7] or 'Москва'}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(bots, ensure_ascii=False)}

    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        bot_id = body.get('id', '')
        if not bot_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'id required'})}

        fields = []
        if 'name' in body:
            fields.append("name = '%s'" % esc(body['name']))
        if 'avatar' in body:
            fields.append("avatar = '%s'" % esc(body['avatar']))
        if 'rating' in body:
            fields.append("rating = %d" % int(body['rating']))
        if 'difficulty' in body and body['difficulty'] in ('easy', 'medium', 'hard', 'master'):
            diff = body['difficulty']
            strength_map = {'easy': 890, 'medium': 1210, 'hard': 1500, 'master': 1900}
            fields.append("difficulty = '%s'" % diff)
            if 'strength' not in body:
                fields.append("strength = %d" % strength_map[diff])
        if 'strength' in body:
            fields.append("strength = %d" % int(body['strength']))
        if 'city' in body:
            city = esc(body['city'])
            fields.append("city = '%s'" % city)
        if 'region' in body:
            fields.append("region = '%s'" % esc(body['region']))

        if not fields:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'no fields to update'})}

        fields.append("updated_at = NOW()")
        cur.execute("UPDATE bots SET %s WHERE id = '%s'" % (', '.join(fields), esc(bot_id)))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}