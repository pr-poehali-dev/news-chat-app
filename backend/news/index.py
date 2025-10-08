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
                    cur.execute("SELECT id, title, content, image_url, created_at FROM news WHERE id = %s", (news_id,))
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
                    cur.execute("SELECT id, title, content, image_url, created_at FROM news ORDER BY created_at DESC")
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
            
            image_url = None
            if image_base64:
                image_url = image_base64
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO news (title, content, image_url) VALUES (%s, %s, %s) RETURNING id, title, content, image_url, created_at",
                    (title, content, image_url)
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
