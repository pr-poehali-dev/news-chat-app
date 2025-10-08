import json
import os
import base64
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление новостями (получение, создание, удаление)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            news_id = params.get('id') if params else None
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if news_id:
                    cur.execute('''SELECT n.id, n.title, n.content, n.image_url, n.created_at, n.author_id,
                                   p.nickname, p.avatar 
                                   FROM news n 
                                   LEFT JOIN profiles p ON n.author_id = p.user_id 
                                   WHERE n.id = %s''', (news_id,))
                    news_item = cur.fetchone()
                    
                    if not news_item:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'isBase64Encoded': False,
                            'body': json.dumps({'error': 'News not found'})
                        }
                    
                    news_item['created_at'] = news_item['created_at'].isoformat()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'news': news_item})
                    }
                else:
                    cur.execute('''SELECT n.id, n.title, n.content, n.image_url, n.created_at, n.author_id,
                                   p.nickname, p.avatar 
                                   FROM news n 
                                   LEFT JOIN profiles p ON n.author_id = p.user_id 
                                   ORDER BY n.created_at DESC''')
                    news_list = cur.fetchall()
                    
                    for news_item in news_list:
                        news_item['created_at'] = news_item['created_at'].isoformat()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'news': news_list})
                    }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '')
            content = body_data.get('content', '')
            image_base64 = body_data.get('image', '')
            author_id = body_data.get('author_id', '')
            
            image_url = None
            if image_base64 and len(image_base64) < 500000:
                image_url = image_base64
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO news (title, content, image_url, author_id) VALUES (%s, %s, %s, %s) RETURNING id, title, content, image_url, created_at, author_id",
                    (title, content, image_url, author_id)
                )
                new_news = cur.fetchone()
                conn.commit()
                
                new_news['created_at'] = new_news['created_at'].isoformat()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'news': new_news})
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            news_id = params.get('id') if params else None
            
            if not news_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'News ID required'})
                }
            
            with conn.cursor() as cur:
                cur.execute("DELETE FROM news WHERE id = %s", (news_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()