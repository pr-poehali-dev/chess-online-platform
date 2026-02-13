import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Получение и обновление настроек сайта (видимость кнопок, доступы по уровням)"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'GET':
        cur.execute("SELECT key, value, description FROM site_settings")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        result = {}
        for row in rows:
            result[row[0]] = {'value': row[1], 'description': row[2] or ''}
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(result)}

    if event.get('httpMethod') == 'PUT':
        body = json.loads(event.get('body', '{}'))
        for key, data in body.items():
            val = str(data.get('value', ''))
            cur.execute(
                "UPDATE site_settings SET value = '%s', updated_at = NOW() WHERE key = '%s'"
                % (val.replace("'", "''"), key.replace("'", "''"))
            )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'ok'})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
