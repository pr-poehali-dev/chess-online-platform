import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Ежедневное снижение рейтинга всех игроков на значение daily_decay"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT key, value FROM rating_settings WHERE key IN ('daily_decay', 'min_rating')")
    settings = {r[0]: r[1] for r in cur.fetchall()}

    decay = abs(int(settings.get('daily_decay', '1')))
    min_rating = int(settings.get('min_rating', '500'))

    if decay == 0:
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'affected': 0, 'decay': 0, 'message': 'Decay is 0, no changes'})}

    cur.execute(
        "UPDATE users SET rating = GREATEST(rating - %d, %d), updated_at = NOW() WHERE rating > %d RETURNING id, rating"
        % (decay, min_rating, min_rating)
    )
    updated = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'affected': len(updated),
            'decay': decay,
            'min_rating': min_rating
        })
    }
