import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение и обновление настроек рейтинговой системы"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        cur = conn.cursor()
        cur.execute("SELECT key, value, description FROM rating_settings ORDER BY id")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        settings = {}
        for row in rows:
            settings[row[0]] = {'value': row[1], 'description': row[2]}

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(settings, ensure_ascii=False)}

    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        cur = conn.cursor()

        for key, val in body.items():
            value = str(val) if not isinstance(val, dict) else str(val.get('value', ''))
            cur.execute(
                "UPDATE rating_settings SET value = '%s', updated_at = NOW() WHERE key = '%s'" % (
                    value.replace("'", "''"), key.replace("'", "''")
                )
            )

        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
