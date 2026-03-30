import json
import os
import hashlib
import secrets
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    """Аутентификация: регистрация и вход пользователей"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')  # 'register' | 'login' | 'logout' | 'me'

    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == 'register':
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not name or not email or not password:
                return {'statusCode': 400, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Заполните все поля'})}

            avatar = name[0].upper()
            pw_hash = hash_password(password)

            cur.execute(
                "INSERT INTO users (name, avatar, email, password_hash) VALUES (%s, %s, %s, %s) RETURNING id, name, avatar, email",
                (name, avatar, email, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 409, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Email уже занят'})}

            user_id, uname, uavatar, uemail = row
            token = secrets.token_hex(32)
            cur.execute(
                "INSERT INTO sessions (user_id, token) VALUES (%s, %s)",
                (str(user_id), token)
            )
            conn.commit()
            return {
                'statusCode': 200, 'headers': CORS_HEADERS,
                'body': json.dumps({
                    'token': token,
                    'user': {'id': str(user_id), 'name': uname, 'avatar': uavatar, 'email': uemail}
                })
            }

        elif action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            pw_hash = hash_password(password)

            cur.execute(
                "SELECT id, name, avatar, email FROM users WHERE email = %s AND password_hash = %s",
                (email, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Неверный email или пароль'})}

            user_id, uname, uavatar, uemail = row
            cur.execute("UPDATE users SET online = TRUE, last_seen = NOW() WHERE id = %s", (str(user_id),))
            token = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (str(user_id), token))
            conn.commit()
            return {
                'statusCode': 200, 'headers': CORS_HEADERS,
                'body': json.dumps({
                    'token': token,
                    'user': {'id': str(user_id), 'name': uname, 'avatar': uavatar, 'email': uemail}
                })
            }

        elif action == 'logout':
            token = (event.get('headers') or {}).get('X-Auth-Token', '')
            if token:
                cur.execute(
                    "UPDATE users SET online = FALSE, last_seen = NOW() WHERE id = (SELECT user_id FROM sessions WHERE token = %s)",
                    (token,)
                )
                cur.execute("DELETE FROM sessions WHERE token = %s", (token,))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

        elif action == 'me':
            token = (event.get('headers') or {}).get('X-Auth-Token', '')
            cur.execute(
                "SELECT u.id, u.name, u.avatar, u.email FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Не авторизован'})}
            user_id, uname, uavatar, uemail = row
            return {
                'statusCode': 200, 'headers': CORS_HEADERS,
                'body': json.dumps({'user': {'id': str(user_id), 'name': uname, 'avatar': uavatar, 'email': uemail}})
            }

        else:
            return {'statusCode': 400, 'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Неизвестное действие'})}

    except Exception as e:
        conn.rollback()
        if 'unique' in str(e).lower():
            return {'statusCode': 409, 'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Email уже занят'})}
        raise
    finally:
        cur.close()
        conn.close()
