import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_id(cur, token: str):
    cur.execute(
        "SELECT user_id FROM sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return str(row[0]) if row else None


def handler(event: dict, context) -> dict:
    """Чаты: список, создание, получение участников"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    token = (event.get('headers') or {}).get('X-Auth-Token', '')
    conn = get_conn()
    cur = conn.cursor()

    try:
        user_id = get_user_id(cur, token)
        if not user_id:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}

        method = event.get('httpMethod', 'GET')
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', '')

        if method == 'GET':
            # Список чатов текущего пользователя
            cur.execute("""
                SELECT
                    c.id,
                    u.id AS other_id,
                    u.name,
                    u.avatar,
                    u.online,
                    u.last_seen,
                    cm_me.is_pinned,
                    (
                        SELECT COUNT(*) FROM messages m
                        LEFT JOIN message_reads mr ON mr.message_id = m.id AND mr.user_id = %s
                        WHERE m.chat_id = c.id AND m.user_id != %s AND mr.message_id IS NULL
                    ) AS unread,
                    (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_text,
                    (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_time,
                    (SELECT user_id FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_sender
                FROM chats c
                JOIN chat_members cm_me ON cm_me.chat_id = c.id AND cm_me.user_id = %s
                JOIN chat_members cm_other ON cm_other.chat_id = c.id AND cm_other.user_id != %s
                JOIN users u ON u.id = cm_other.user_id
                ORDER BY last_time DESC NULLS LAST
            """, (user_id, user_id, user_id, user_id))

            rows = cur.fetchall()
            chats = []
            for row in rows:
                chat_id, other_id, name, avatar, online, last_seen, is_pinned, unread, last_text, last_time, last_sender = row
                chats.append({
                    'id': str(chat_id),
                    'user': {
                        'id': str(other_id),
                        'name': name,
                        'avatar': avatar,
                        'online': online,
                        'lastSeen': last_seen.isoformat() if last_seen else None,
                    },
                    'isPinned': is_pinned,
                    'unread': unread,
                    'lastMessage': {
                        'text': last_text,
                        'time': last_time.isoformat() if last_time else None,
                        'fromMe': str(last_sender) == user_id if last_sender else False,
                    } if last_text else None,
                })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'chats': chats})}

        elif action == 'create':
            # Создать чат с пользователем
            other_email = body.get('email', '').strip().lower()
            other_id = body.get('userId', '')

            if other_email:
                cur.execute("SELECT id FROM users WHERE email = %s", (other_email,))
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
                other_id = str(row[0])

            if not other_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Укажите userId или email'})}

            if other_id == user_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Нельзя создать чат с собой'})}

            # Проверяем, нет ли уже чата
            cur.execute("""
                SELECT c.id FROM chats c
                JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
                JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
            """, (user_id, other_id))
            existing = cur.fetchone()
            if existing:
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'chatId': str(existing[0])})}

            cur.execute("INSERT INTO chats DEFAULT VALUES RETURNING id")
            chat_id = str(cur.fetchone()[0])
            cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
            cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, other_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'chatId': chat_id})}

        elif action == 'pin':
            chat_id = body.get('chatId', '')
            pinned = body.get('pinned', True)
            cur.execute(
                "UPDATE chat_members SET is_pinned = %s WHERE chat_id = %s AND user_id = %s",
                (pinned, chat_id, user_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        cur.close()
        conn.close()
