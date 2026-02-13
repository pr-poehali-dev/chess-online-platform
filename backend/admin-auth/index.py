import json
import os
import psycopg2


def handler(event, context):
    """Проверка админского доступа по email после OTP-верификации"""
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

    if not email or '@' not in email:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid email'})}

    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    cur.execute(
        "SELECT id, email FROM {schema}.admins WHERE email = '{email}'".format(
            schema=schema, email=email.replace("'", "''")
        )
    )
    admin = cur.fetchone()
    cur.close()
    conn.close()

    if not admin:
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied', 'message': 'Этот email не имеет доступа к админ-панели'})}

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'admin': {'id': admin[0], 'email': admin[1]}})
    }
