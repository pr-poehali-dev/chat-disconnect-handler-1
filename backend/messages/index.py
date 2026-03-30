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
    """Сообщения: получение, отправка, отметка о прочтении"""
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
        params = event.get('queryStringParameters') or {}
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', '')

        if method == 'GET':
            chat_id = params.get('chatId', '')
            if not chat_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'chatId обязателен'})}

            # Проверяем что пользователь в чате
            cur.execute("SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            if not cur.fetchone():
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Нет доступа'})}

            cur.execute("""
                SELECT m.id, m.user_id, m.text, m.created_at,
                       EXISTS(SELECT 1 FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id != m.user_id) AS is_read
                FROM messages m
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
                LIMIT 100
            """, (chat_id,))
            rows = cur.fetchall()

            messages = []
            for row in rows:
                msg_id, msg_user_id, text, created_at, is_read = row
                from_me = str(msg_user_id) == user_id
                status = 'read' if is_read else ('delivered' if not from_me else 'sent')
                messages.append({
                    'id': str(msg_id),
                    'chatId': chat_id,
                    'fromMe': from_me,
                    'text': text,
                    'time': created_at.isoformat(),
                    'status': status,
                })

            # Отмечаем все входящие как прочитанные
            cur.execute("""
                INSERT INTO message_reads (message_id, user_id)
                SELECT m.id, %s FROM messages m
                WHERE m.chat_id = %s AND m.user_id != %s
                ON CONFLICT DO NOTHING
            """, (user_id, chat_id, user_id))
            conn.commit()

            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'messages': messages})}

        elif action == 'send':
            chat_id = body.get('chatId', '')
            text = body.get('text', '').strip()

            if not chat_id or not text:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'chatId и text обязательны'})}

            # Проверяем что пользователь в чате
            cur.execute("SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            if not cur.fetchone():
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Нет доступа'})}

            cur.execute(
                "INSERT INTO messages (chat_id, user_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                (chat_id, user_id, text)
            )
            msg_id, created_at = cur.fetchone()
            conn.commit()

            return {
                'statusCode': 200, 'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': {
                        'id': str(msg_id),
                        'chatId': chat_id,
                        'fromMe': True,
                        'text': text,
                        'time': created_at.isoformat(),
                        'status': 'sent',
                    }
                })
            }

        elif action == 'markRead':
            chat_id = body.get('chatId', '')
            cur.execute("""
                INSERT INTO message_reads (message_id, user_id)
                SELECT m.id, %s FROM messages m
                WHERE m.chat_id = %s AND m.user_id != %s
                ON CONFLICT DO NOTHING
            """, (user_id, chat_id, user_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        cur.close()
        conn.close()
