import json
import os
import psycopg2


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


def handler(event, context):
    """Статистика платформы и очистка данных для админ-панели"""
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
    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    method = event.get('httpMethod', 'GET')

    limit = 30 if method == 'GET' else 5
    if check_rate_limit(cur, conn, client_ip, 'admin-stats', limit, 60):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    if method == 'GET':
        cur.execute("SELECT COUNT(*) FROM {s}.users".format(s=schema))
        total_users = cur.fetchone()[0]

        cur.execute(
            "SELECT COUNT(*) FROM {s}.users WHERE last_online > NOW() - INTERVAL '5 minutes'".format(s=schema)
        )
        online_users = cur.fetchone()[0]

        cur.execute(
            "SELECT COUNT(*) FROM {s}.online_games WHERE status = 'playing'".format(s=schema)
        )
        active_games = cur.fetchone()[0]

        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'total_users': total_users,
                'online_users': online_users,
                'active_games': active_games
            })
        }

    if method == 'POST':
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) and raw_body.strip() else {}
        action = body.get('action', '')
        admin_email = body.get('admin_email', '').strip().lower()

        if not admin_email:
            cur.close()
            conn.close()
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'})}

        cur.execute(
            "SELECT id FROM {s}.admins WHERE email = '{e}'".format(
                s=schema, e=admin_email.replace("'", "''")
            )
        )
        if not cur.fetchone():
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'})}

        if action == 'wipe_all':
            cur.execute("DELETE FROM {s}.game_history".format(s=schema))
            cur.execute("DELETE FROM {s}.online_games".format(s=schema))
            cur.execute("DELETE FROM {s}.matchmaking_queue".format(s=schema))
            cur.execute("DELETE FROM {s}.game_invites".format(s=schema))
            cur.execute("DELETE FROM {s}.chat_messages".format(s=schema))
            cur.execute("DELETE FROM {s}.friends".format(s=schema))
            cur.execute("DELETE FROM {s}.otp_codes".format(s=schema))
            cur.execute("DELETE FROM {s}.rate_limits".format(s=schema))
            cur.execute("DELETE FROM {s}.users".format(s=schema))
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'All user data wiped'})
            }

        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Unknown action'})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
