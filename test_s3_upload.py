import boto3
from botocore.client import Config
import os

# S3配置
endpoint = 'http://localhost:9090'
access_key = 'rustfs'
secret_key = 'rustfs_secret'
bucket_name = 'geonexus-assets'

# 创建S3客户端
s3 = boto3.client(
    's3',
    endpoint_url=endpoint,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    config=Config(signature_version='s3v4'),
    region_name='cn-north-1'
)

try:
    # 测试列出bucket
    print("测试列出bucket...")
    response = s3.list_buckets()
    print("Bucket列表:", [b['Name'] for b in response['Buckets']])
    
    # 测试上传文件
    print("测试上传文件...")
    with open('test_upload.txt', 'rb') as f:
        s3.upload_fileobj(f, bucket_name, 'test_file.txt')
    print("文件上传成功！")
    
    # 测试列出文件
    print("测试列出文件...")
    objects = s3.list_objects(Bucket=bucket_name)
    if 'Contents' in objects:
        print("文件列表:", [obj['Key'] for obj in objects['Contents']])
    
except Exception as e:
    print(f"错误: {e}")