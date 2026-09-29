import os
import mimetypes
import boto3
from botocore.exceptions import ClientError

AWS_ACCESS_KEY_ID = "AKIA2IIKFGA2NIIT4MG2"
AWS_SECRET_ACCESS_KEY = "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"
REGION = "us-east-1"
BUCKET_NAME = "vizzy-studio-frontend-prod"

s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=REGION
)

def create_and_configure_bucket():
    print(f"Ensuring S3 bucket '{BUCKET_NAME}' exists...")
    try:
        s3.create_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        code = e.response['Error']['Code']
        if code in ['BucketAlreadyOwnedByYou', 'BucketAlreadyExists']:
            print(f"Bucket {BUCKET_NAME} already exists.")
        else:
            print(f"Error creating bucket: {e}")

    # Remove Public Access Block so static website is publicly reachable
    try:
        s3.delete_public_access_block(Bucket=BUCKET_NAME)
    except Exception as e:
        print(f"Notice regarding public access block: {e}")

    # Enable Static Website Hosting
    website_configuration = {
        'ErrorDocument': {'Key': 'index.html'},
        'IndexDocument': {'Suffix': 'index.html'},
    }
    s3.put_bucket_website(Bucket=BUCKET_NAME, WebsiteConfiguration=website_configuration)

    # Set Bucket Policy for Public Read
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
            }
        ]
    }
    import json
    try:
        s3.put_bucket_policy(Bucket=BUCKET_NAME, Policy=json.dumps(bucket_policy))
    except Exception as e:
        print(f"Bucket policy update warning: {e}")

def upload_dist_folder():
    dist_dir = "/home/kv/Projects/suraj-task/dist"
    print(f"Uploading files from {dist_dir} to s3://{BUCKET_NAME}/...")
    
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, dist_dir)
            s3_key = relative_path.replace("\\", "/")

            content_type, _ = mimetypes.guess_type(local_path)
            if not content_type:
                if local_path.endswith('.js'):
                    content_type = 'application/javascript'
                elif local_path.endswith('.css'):
                    content_type = 'text/css'
                elif local_path.endswith('.svg'):
                    content_type = 'image/svg+xml'
                else:
                    content_type = 'binary/octet-stream'

            extra_args = {'ContentType': content_type}
            
            print(f"Uploading {s3_key} ({content_type})...")
            s3.upload_file(local_path, BUCKET_NAME, s3_key, ExtraArgs=extra_args)

if __name__ == "__main__":
    create_and_configure_bucket()
    upload_dist_folder()
    url = f"http://{BUCKET_NAME}.s3-website-{REGION}.amazonaws.com"
    print("\n==============================================")
    print("🎉 S3 FRONTEND DEPLOYMENT COMPLETE!")
    print(f"Live S3 Website URL: {url}")
    print("==============================================")
