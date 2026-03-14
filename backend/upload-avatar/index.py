import json
import os
import base64
import uuid
import boto3

from botocore.exceptions import ClientError


MAX_FILE_SIZE = 3 * 1024 * 1024  # 3 МБ


def handler(event: dict, context) -> dict:
    """Загрузка аватарки на S3. Принимает base64-изображение, возвращает CDN URL."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    image_data = body.get('image', '')
    filename_hint = body.get('filename', 'avatar.jpg')

    if not image_data:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'image required'})}

    # Определяем content-type и декодируем base64
    content_type = 'image/jpeg'
    if ',' in image_data:
        header, image_data = image_data.split(',', 1)
        if 'png' in header:
            content_type = 'image/png'
        elif 'gif' in header:
            content_type = 'image/gif'
        elif 'webp' in header:
            content_type = 'image/webp'

    raw = base64.b64decode(image_data)

    if len(raw) > MAX_FILE_SIZE:
        return {'statusCode': 413, 'headers': headers, 'body': json.dumps({'error': 'File too large. Maximum size is 3 MB'})}

    ext = 'jpg'
    if content_type == 'image/png':
        ext = 'png'
    elif content_type == 'image/gif':
        ext = 'gif'
    elif content_type == 'image/webp':
        ext = 'webp'

    key = f'avatars/{uuid.uuid4()}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    s3.put_object(
        Bucket='files',
        Key=key,
        Body=raw,
        ContentType=content_type,
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'url': cdn_url})
    }